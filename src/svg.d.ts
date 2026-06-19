// SVGR: `import Bell from './bell.svg'` → React 컴포넌트.
// `import url from './bell.svg?url'` → 정적 URL 문자열(기존 동작 유지).
declare module '*.svg' {
  import type { FC, SVGProps } from 'react'
  const ReactComponent: FC<SVGProps<SVGSVGElement>>
  export default ReactComponent
}

declare module '*.svg?url' {
  const url: string
  export default url
}
