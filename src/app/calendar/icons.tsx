/* 올챙이 아이콘 — public/icons/*.svg 를 SVGR 로 직접 import 한다(단일 원본 = .svg 파일).
   아이콘 추가/수정: public/icons/ 에 .svg 를 넣고 아래 import + ICON_MAP 에만 등록.
   사용: <Icon name="bell" size={20} color="var(--book-cloth)" />
        또는 하위 호환 alias <IcBell size={20} /> */
import type { ComponentType, CSSProperties, SVGProps } from 'react'

import ArrowDown from '../../../public/icons/arrow-down.svg'
import ArrowUp from '../../../public/icons/arrow-up.svg'
import Bell from '../../../public/icons/bell.svg'
import CalendarPlus from '../../../public/icons/calendar-plus.svg'
import Chart from '../../../public/icons/chart.svg'
import Check from '../../../public/icons/check.svg'
import ChevronDown from '../../../public/icons/chevron-down.svg'
import ChevronLeft from '../../../public/icons/chevron-left.svg'
import ChevronRight from '../../../public/icons/chevron-right.svg'
import Clock from '../../../public/icons/clock.svg'
import Close from '../../../public/icons/close.svg'
import Doc from '../../../public/icons/doc.svg'
import Dots from '../../../public/icons/dots.svg'
import Edit from '../../../public/icons/edit.svg'
import Eye from '../../../public/icons/eye.svg'
import Filter from '../../../public/icons/filter.svg'
import Gear from '../../../public/icons/gear.svg'
import Lock from '../../../public/icons/lock.svg'
import Logout from '../../../public/icons/logout.svg'
import Memo from '../../../public/icons/memo.svg'
import Pin from '../../../public/icons/pin.svg'
import Plus from '../../../public/icons/plus.svg'
import Search from '../../../public/icons/search.svg'
import Send from '../../../public/icons/send.svg'
import Sync from '../../../public/icons/sync.svg'
import Tag from '../../../public/icons/tag.svg'
import Trash from '../../../public/icons/trash.svg'
import Users from '../../../public/icons/users.svg'
import Won from '../../../public/icons/won.svg'

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>

const ICON_MAP = {
  'arrow-down': ArrowDown,
  'arrow-up': ArrowUp,
  bell: Bell,
  'calendar-plus': CalendarPlus,
  chart: Chart,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  clock: Clock,
  close: Close,
  doc: Doc,
  dots: Dots,
  edit: Edit,
  eye: Eye,
  filter: Filter,
  gear: Gear,
  lock: Lock,
  logout: Logout,
  memo: Memo,
  pin: Pin,
  plus: Plus,
  search: Search,
  send: Send,
  sync: Sync,
  tag: Tag,
  trash: Trash,
  users: Users,
  won: Won,
} satisfies Record<string, SvgComponent>

export type IconName = keyof typeof ICON_MAP

export interface IconProps {
  size?: number
  color?: string
  style?: CSSProperties
}

// SVGR 컴포넌트를 size/color API 로 감싼다.
// .svg 들은 stroke="currentColor" 라 style.color 로 stroke·fill 을 함께 제어한다.
export function Icon({
  name,
  size = 20,
  color = 'currentColor',
  style,
}: IconProps & { name: IconName }) {
  const Svg = ICON_MAP[name]
  return <Svg width={size} height={size} style={{ color, ...style }} />
}

// ── 하위 호환 alias (Calendar.tsx 등 기존 호출부 유지) ──
const mk = (name: IconName) => {
  const C = (p: IconProps) => <Icon name={name} {...p} />
  C.displayName = `Ic_${name}`
  return C
}
export const IcCalPlus = mk('calendar-plus')
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
