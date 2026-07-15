/* 올챙이 아이콘 — public/icons/*.svg 를 SVGR 로 직접 import 한다(단일 원본 = .svg 파일).
   아이콘 추가: public/icons/ 에 .svg 를 넣고 import + ICON_MAP 에 등록한 뒤,
   아래 패턴(`export const IcXxx = mk('name')`)으로 호출부용 alias 를 노출한다.
   사용: <IcBell size={20} color="var(--book-cloth)" /> */
import type { ComponentType, CSSProperties, SVGProps } from 'react'

import Bell from '../../../public/icons/bell.svg'
// import CalendarPlus from '../../../public/icons/calendar-plus.svg'
import Check from '../../../public/icons/check.svg'
import ChevronLeft from '../../../public/icons/chevron-left.svg'
import ChevronRight from '../../../public/icons/chevron-right.svg'
import Clock from '../../../public/icons/clock.svg'
import Close from '../../../public/icons/close.svg'
import Edit from '../../../public/icons/edit.svg'
import Gear from '../../../public/icons/gear.svg'
import Lock from '../../../public/icons/lock.svg'
import Memo from '../../../public/icons/memo.svg'
import Pin from '../../../public/icons/pin.svg'
import Tag from '../../../public/icons/tag.svg'
import Trash from '../../../public/icons/trash.svg'

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>

const ICON_MAP = {
  bell: Bell,
  // 'calendar-plus': CalendarPlus,
  check: Check,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  clock: Clock,
  close: Close,
  edit: Edit,
  gear: Gear,
  lock: Lock,
  memo: Memo,
  pin: Pin,
  tag: Tag,
  trash: Trash,
} satisfies Record<string, SvgComponent>

type IconName = keyof typeof ICON_MAP

interface IconProps {
  size?: number
  color?: string
  style?: CSSProperties
}

// SVGR 컴포넌트를 size/color API 로 감싼다.
// .svg 들은 stroke="currentColor" 라 style.color 로 stroke·fill 을 함께 제어한다.
function Icon({
  name,
  size = 20,
  color = 'currentColor',
  style,
}: IconProps & { name: IconName }) {
  const Svg = ICON_MAP[name]
  // flexShrink:0 — flex 컨테이너(칩·버튼 등)에서 옆 텍스트가 길어도 아이콘이
  // 함께 줄어들지 않게. (안 넣으면 제목 길이에 따라 체크 크기가 달라짐)
  return <Svg width={size} height={size} style={{ color, flexShrink: 0, ...style }} />
}

// 호출부(Calendar.tsx)용 alias
const mk = (name: IconName) => {
  const C = (p: IconProps) => <Icon name={name} {...p} />
  C.displayName = `Ic_${name}`
  return C
}
// export const IcCalPlus = mk('calendar-plus')
export const IcBell = mk('bell')
export const IcGear = mk('gear')
export const IcChevL = mk('chevron-left')
export const IcChevR = mk('chevron-right')
export const IcClose = mk('close')
export const IcCheck = mk('check')
export const IcEdit = mk('edit')
export const IcTrash = mk('trash')
export const IcClock = mk('clock')
export const IcLock = mk('lock')
export const IcPin = mk('pin')
export const IcTag = mk('tag')
export const IcMemo = mk('memo')

/* 올챙이 — 컬러 로고 마크 (투명 배경). size = 높이(px), 가로는 비율 유지 */
const LOGO_AR = 279 / 173
export const LogoTadpole = ({
  size = 26,
  style,
}: {
  size?: number
  style?: CSSProperties
}) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="/olchaengi-logo.png"
    alt="올챙이"
    width={Math.round(size * LOGO_AR)}
    height={size}
    style={{ display: 'block', ...style }}
  />
)
