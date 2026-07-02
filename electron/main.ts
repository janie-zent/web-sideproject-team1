import {
  app,
  BrowserWindow,
  protocol,
  net,
  shell,
  ipcMain,
  Notification,
  Tray,
  Menu,
  nativeImage,
  nativeTheme,
  screen,
} from 'electron'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// 개발(next dev) vs 프로덕션(패키징된 정적 export) 구분
const isDev = !app.isPackaged

// 길게 살아있어야 하는 참조들. ⚠️ Tray 는 모듈 스코프에 보관해야 한다 —
// 함수 지역변수로 두면 V8 GC 가 수거해 메뉴바 아이콘이 잠시 후 사라진다.
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let popover: BrowserWindow | null = null
let popoverHideTimer: NodeJS.Timeout | null = null
let isQuitting = false
// 표시 중인 Notification 참조 보관 — 미보관 시 GC 가 수거해 이벤트/표시가 누락될 수 있다.
const activeNotifications = new Set<Notification>()

// 프로덕션에서 UI 를 서빙할 커스텀 스킴.
//
// 왜 file:// 이 아닌가:
//   Chromium 은 "비표준 스킴"에서 IndexedDB·localStorage·cookies 를 비활성화한다.
//   file:// 이 바로 비표준 스킴이라, file:// 로 로드하면 이 앱의 데이터 계층
//   (Dexie/IndexedDB) 이 SecurityError 로 깨지고 아무것도 저장되지 않는다.
//   또한 Next 가 내보내는 절대경로 /_next/* 자산이 파일시스템 루트로 잘못 해석된다.
//
// app:// 을 standard + secure 스킴으로 등록하면 안정적인 보안 origin 이 생겨
//   ① 웹 저장소 API 가 정상 동작하고 ② /_next/* 절대경로가 out/ 기준으로 해석된다.
const APP_SCHEME = 'app'

// ⚠️ app 'ready' 이전에 호출되어야 한다.
protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true, // 상대/절대 URL 해석 (RFC 3986)
      secure: true, // secure context → IndexedDB/crypto.subtle 등 활성화
      supportFetchAPI: true,
    },
  },
])

// out/ 디렉터리를 app:// 스킴으로 서빙하는 핸들러.
// Nginx 스타일 폴백: 정확한 파일 → <path>.html → <path>/index.html → 404.html
function registerAppProtocol() {
  const outDir = path.join(__dirname, '..', 'out')

  protocol.handle(APP_SCHEME, async (request) => {
    const { pathname } = new URL(request.url)
    // 디코드 + 선행 슬래시 제거. 빈 경로는 index 로.
    let relPath = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html'

    // 경로 탈출(path traversal) 방지: 항상 outDir 내부로 클램프한다.
    const resolve = (p: string) => {
      const full = path.normalize(path.join(outDir, p))
      return full.startsWith(outDir) ? full : null
    }

    // trailingSlash:true 라 라우트는 폴더/index.html 형태로 떨어진다.
    const candidates = [
      relPath,
      `${relPath}.html`,
      path.join(relPath, 'index.html'),
      '404.html',
    ]

    for (const candidate of candidates) {
      const full = resolve(candidate)
      if (!full) continue
      try {
        return await net.fetch(pathToFileURL(full).toString())
      } catch {
        // 다음 후보로
      }
    }
    return new Response('Not Found', { status: 404 })
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    // 캘린더 7열 그리드가 읽을 만한 최소치(그 이하는 칩이 과하게 잘림).
    // 상세 패널(430px)을 열면 캘린더가 좁아지니 필요 시 창을 넓히면 된다.
    minWidth: 860,
    minHeight: 600,
    // 네이티브 타이틀바를 숨기고 신호등만 앱 헤더 위에 올린다(디자인의 통합 룩).
    // 헤더 높이 58px 안에 세로 중앙 정렬되도록 위치를 잡는다.
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 18, y: 21 },
    backgroundColor: '#191919',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // 보안 기본값 — 명시적으로 적어 두되, 모두 Electron 기본값이다.
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })
  mainWindow = win
  win.on('closed', () => {
    mainWindow = null
  })

  // 외부 링크는 OS 기본 브라우저로, 앱 윈도우 신규 생성은 차단.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // 앱 origin 밖으로의 네비게이션 차단.
  win.webContents.on('will-navigate', (event, url) => {
    const allowed = isDev ? 'http://localhost:14000' : `${APP_SCHEME}://`
    if (!url.startsWith(allowed)) event.preventDefault()
  })

  if (isDev) {
    win.loadURL('http://localhost:14000')
    win.webContents.openDevTools()
  } else {
    win.loadURL(`${APP_SCHEME}://./`)
  }
}

function showMainWindow() {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  } else {
    createWindow()
  }
}

// ── 트레이 + 팝오버(메뉴바 우측 아이콘 + 클릭 시 뜨는 작은 패널) ──────────

function popoverUrl() {
  // 팝오버 콘텐츠는 Next 라우트 /popover — 기존 app:// 파이프라인을 그대로 재사용.
  return isDev ? 'http://localhost:14000/popover/' : `${APP_SCHEME}://./popover/`
}

function createPopover() {
  popover = new BrowserWindow({
    width: 320,
    height: 380,
    show: false,
    frame: false, // 크롬 없음 → frameless. macOS 는 roundedCorners 기본 true 라 둥근 모서리.
    resizable: false,
    movable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    // 투명 대신 테마색 배경 — 투명+vibrancy 의 화이트 플래시 버그를 피한다.
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0a0a0a' : '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  popover.loadURL(popoverUrl())

  // 포커스를 잃으면 숨긴다. 단, 트레이 아이콘을 다시 클릭한 "닫기" 의도와
  // blur 가 경합하므로 약간 지연시켜 토글 핸들러가 취소할 수 있게 한다.
  popover.on('blur', () => {
    popoverHideTimer = setTimeout(() => {
      popover?.hide()
      popoverHideTimer = null
    }, 150)
  })

  // 팝오버는 파괴(destroy)하지 말고 숨긴다(hide). 종료 중일 때만 진짜로 닫는다.
  popover.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      popover?.hide()
    }
  })
}

function positionPopover(bounds?: Electron.Rectangle) {
  if (!popover) return
  const tb = bounds && bounds.width ? bounds : tray?.getBounds()
  if (!tb) return
  const winB = popover.getBounds()
  const display = screen.getDisplayNearestPoint({ x: tb.x, y: tb.y })
  let x = Math.round(tb.x + tb.width / 2 - winB.width / 2)
  const y = Math.round(display.workArea.y + 4) // 메뉴바 바로 아래
  // 멀티모니터 가장자리로 넘어가지 않도록 x 를 디스플레이 범위로 클램프.
  const minX = display.bounds.x
  const maxX = display.bounds.x + display.bounds.width - winB.width
  x = Math.max(minX, Math.min(x, maxX))
  popover.setPosition(x, y, false)
}

function togglePopover(bounds?: Electron.Rectangle) {
  if (!popover) return
  // 열린 상태에서 트레이를 다시 클릭 → 대기 중인 blur-hide 를 취소하고 닫기.
  if (popoverHideTimer) {
    clearTimeout(popoverHideTimer)
    popoverHideTimer = null
    popover.hide()
    return
  }
  if (popover.isVisible()) {
    popover.hide()
    return
  }
  positionPopover(bounds)
  popover.show()
  popover.focus()
}

function createTray() {
  // 커밋된 정적 아이콘(올챙이 브랜드 컬러 로고). electron/assets 는 electron-builder files
  // 글롭으로 asar 에 포함되며, ../electron/assets 경로가 dev(소스 트리)·prod(asar) 모두에서
  // 동일하게 해석된다. 아이콘 교체 시 electron/assets/trayIcon.png (+ @2x) 만 바꾸면 된다.
  // createFromPath 는 같은 폴더의 trayIcon@2x.png 를 레티나용으로 자동 인식한다.
  const iconPath = path.join(__dirname, '..', 'electron', 'assets', 'trayIcon.png')
  const icon = nativeImage.createFromPath(iconPath)
  if (icon.isEmpty()) {
    // createFromPath 는 경로 오류 시 throw 하지 않고 빈 이미지를 준다 → 명시 로깅.
    console.error('[tray] icon not found / empty at', iconPath)
  }
  // 컬러 브랜드 로고라 Template(검정+알파, 메뉴바 틴트 자동) 모드를 쓰지 않는다.
  // 단색 메뉴바 아이콘으로 바꾸려면 검정+알파 PNG 로 교체 후 setTemplateImage(true).
  icon.setTemplateImage(false)

  tray = new Tray(icon)
  tray.setToolTip('세무일정관리')
  if (process.platform === 'darwin') tray.setIgnoreDoubleClickEvents(true)

  // 좌클릭 → 팝오버 토글. (setContextMenu 를 쓰면 좌클릭을 가로채므로 쓰지 않는다.)
  tray.on('click', (_event, bounds) => togglePopover(bounds))

  // 우클릭(또는 Control+클릭) → 작은 컨텍스트 메뉴.
  const menu = Menu.buildFromTemplate([
    { label: '세무일정관리 열기', click: () => showMainWindow() },
    {
      label: '알림 패널 열기',
      click: () => {
        positionPopover(tray?.getBounds())
        popover?.show()
        popover?.focus()
      },
    },
    { type: 'separator' },
    { label: '종료', click: () => app.quit() },
  ])
  tray.on('right-click', () => tray?.popUpContextMenu(menu))
}

// 렌더러가 보낸 IPC 의 발신지(senderFrame)가 우리 앱 origin 인지 검증.
// 이 앱은 자기 콘텐츠만 로드하지만, 문서가 권장하는 방어 기본기다.
function isTrustedSender(url: string): boolean {
  try {
    const { protocol: scheme, host } = new URL(url)
    if (isDev) return scheme === 'http:' && host === 'localhost:14000'
    return scheme === `${APP_SCHEME}:`
  } catch {
    return false
  }
}

function registerIpcHandlers() {
  // OS 네이티브 알림 — preload 가 노출한 window.electronAPI.notify 가 호출한다.
  // 'show'/'failed' 이벤트를 기다려 실제 표시 여부를 정확히 반환한다.
  // macOS 권한이 꺼져 있으면 'failed' (UNErrorDomain 오류 1)가 발생한다.
  ipcMain.handle('notify', (event, payload: { title: string; body: string }) => {
    if (!isTrustedSender(event.senderFrame?.url ?? '')) return { ok: false, reason: 'untrusted-sender' }
    if (!Notification.isSupported()) return { ok: false, reason: 'unsupported' }

    return new Promise<{ ok: boolean; reason?: string; detail?: string }>((resolve) => {
      const n = new Notification({
        title: String(payload?.title ?? ''),
        body: String(payload?.body ?? ''),
      })
      activeNotifications.add(n) // GC 방지

      let settled = false
      const done = (r: { ok: boolean; reason?: string; detail?: string }) => {
        if (settled) return
        settled = true
        resolve(r)
      }

      n.on('show', () => done({ ok: true }))
      n.on('failed', (_e, err) => done({ ok: false, reason: 'not-allowed', detail: String(err) }))
      n.on('close', () => activeNotifications.delete(n))
      n.show()

      // 일부 macOS 버전은 'show' 를 안 쏠 수 있어 안전 타임아웃 (failed 가 먼저 오면 무시됨).
      setTimeout(() => done({ ok: true, reason: 'no-event' }), 1500)
    })
  })

  // macOS 알림 설정 화면 열기 (권한이 꺼져 있을 때 사용자 안내용)
  ipcMain.handle('open-notification-settings', (event) => {
    if (!isTrustedSender(event.senderFrame?.url ?? '')) return
    if (process.platform === 'darwin') {
      shell.openExternal('x-apple.systempreferences:com.apple.preference.notifications')
    }
  })

  // 트레이 팝오버 → 메인 윈도우 표시
  ipcMain.handle('open-main-window', (event) => {
    if (!isTrustedSender(event.senderFrame?.url ?? '')) return
    popover?.hide()
    showMainWindow()
  })

  // 트레이 팝오버 → 앱 종료
  ipcMain.handle('quit-app', (event) => {
    if (!isTrustedSender(event.senderFrame?.url ?? '')) return
    app.quit()
  })
}

// 중복 실행 방지: 두 번째 인스턴스가 뜨면 즉시 종료하고, 기존 창을 포커스.
if (!app.requestSingleInstanceLock()) {
  app.quit()
}
app.on('second-instance', () => showMainWindow())

// 종료 중에는 팝오버 close 인터셉터가 진짜 종료를 막지 않도록 플래그를 세운다.
app.on('before-quit', () => {
  isQuitting = true
})

app.whenReady().then(() => {
  if (!isDev) registerAppProtocol()
  registerIpcHandlers()
  createWindow()
  createPopover()
  createTray()

  // macOS: Dock 아이콘 클릭 시 창이 없으면 다시 생성.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  // macOS 관습: 창을 모두 닫아도 (트레이로) 앱은 살아있음.
  if (process.platform !== 'darwin') app.quit()
})
