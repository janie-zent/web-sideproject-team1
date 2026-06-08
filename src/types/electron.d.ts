// Electron preload(contextBridge)가 렌더러 window 에 주입하는 API 타입.
// 일반 브라우저에서는 window.electronAPI 가 undefined 이다.
export interface ElectronAPI {
  isElectron: true
  notify: (title: string, body: string) => Promise<{ ok: boolean; reason?: string; detail?: string }>
  openNotificationSettings: () => Promise<void>
  openMainWindow: () => Promise<void>
  quitApp: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
