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

  // .svg 를 React 컴포넌트로 import (SVGR). `import X from './x.svg?url'` 는 기존처럼 URL 로 유지.
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'))
    if (fileLoaderRule) {
      config.module.rules.push(
        { ...fileLoaderRule, test: /\.svg$/i, resourceQuery: /url/ },
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not ?? []), /url/] },
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                // 기본 SVGO 는 width/height 가 있으면 viewBox 를 제거한다.
                // viewBox 가 없으면 size(width/height) prop 으로 스케일이 안 돼
                // 24단위 좌표가 그대로 그려져 아이콘이 박스를 넘치고(잘림) 아래로 처진다.
                // → viewBox 를 반드시 보존한다.
                svgoConfig: {
                  plugins: [
                    { name: 'preset-default', params: { overrides: { removeViewBox: false } } },
                  ],
                },
              },
            },
          ],
        },
      )
      fileLoaderRule.exclude = /\.svg$/i
    } else {
      config.module.rules.push({ test: /\.svg$/i, use: ['@svgr/webpack'] })
    }
    return config
  },
}

export default nextConfig
