/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Electron 데스크톱앱은 정적 사이트를 패키징해 로드한다.
  // `next build` 시 out/ 에 순수 HTML/CSS/JS 를 생성한다 (별도 next export 불필요).
  output: 'export',

  // 정적 export 에서는 기본 이미지 최적화(서버 필요)를 쓸 수 없다.
  // 현재 next/image 미사용이지만, 추후 도입 시 빌드가 깨지지 않도록 미리 꺼 둔다.
  images: { unoptimized: true },

  // 모든 라우트를 <route>/index.html 로 내보내, app:// 프로토콜 핸들러의
  // 폴백 로직과 (향후) 중첩 라우트 해석을 단순/일관되게 만든다.
  trailingSlash: true,

  // assetPrefix 는 의도적으로 추가하지 않는다.
  // app:// 표준 스킴이 실제 origin 을 제공하므로 /_next/* 절대경로가 그대로 해석되며,
  // 상대 assetPrefix 는 public 자산/중첩 라우트/HMR 을 깨뜨린다.
}

export default nextConfig
