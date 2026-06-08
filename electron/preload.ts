// 메인↔렌더러 사이의 안전한 다리.
//
// 보안 원칙: ipcRenderer / fs / path 를 통째로 노출하지 않는다.
// "기능당 좁은 메서드 하나씩"만 window.electronAPI 로 내보낸다.
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Electron 환경인지 렌더러가 감지하는 플래그 (브라우저에는 이 객체 자체가 없음)
  isElectron: true,

  // OS 네이티브 알림 요청 → 메인 프로세스의 Notification 으로 위임
  notify: (title: string, body: string): Promise<{ ok: boolean; reason?: string; detail?: string }> =>
    ipcRenderer.invoke('notify', { title, body }),

  // macOS 알림 설정 화면 열기 (권한 꺼져 있을 때)
  openNotificationSettings: (): Promise<void> => ipcRenderer.invoke('open-notification-settings'),

  // 메인 윈도우 표시/포커스 (트레이 팝오버에서 "전체 보기")
  openMainWindow: (): Promise<void> => ipcRenderer.invoke('open-main-window'),

  // 앱 종료 (트레이 팝오버에서 "종료")
  quitApp: (): Promise<void> => ipcRenderer.invoke('quit-app'),
})
