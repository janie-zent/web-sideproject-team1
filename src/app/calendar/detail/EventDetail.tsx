'use client'

/* 올챙이 — 일정 상세 패널(우측 하프). 세무 일정은 읽기 전용, 개인 일정은 삭제/수정 가능.
   보조 컴포넌트 CatBadge(카테고리 배지) · DetailRow(아이콘+라벨+값)는 이 패널 전용이라 내부에 둔다. */
import { CATS, type CalEvent, type CatKey } from '../data'
import {
  IcBell,
  IcClock,
  IcClose,
  IcEdit,
  IcLock,
  IcMemo,
  IcPin,
  IcTag,
  IcTrash,
} from '../icons'

// ── 카테고리 배지 ────────────────────────────────────────
function CatBadge({ cat }: { cat: CatKey }) {
  const meta = CATS[cat]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 11px',
        borderRadius: 'var(--radius-pill)',
        fontSize: 12,
        fontWeight: 600,
        background: `color-mix(in srgb, ${meta.color} 18%, transparent)`,
        color: meta.color,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color }} />
      {meta.label}
    </span>
  )
}

function DetailRow({
  icon,
  label,
  value,
  multiline,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  multiline?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 11, alignItems: multiline ? 'flex-start' : 'center' }}>
      <div style={{ width: 20, flexShrink: 0, marginTop: multiline ? 1 : 0 }}>{icon}</div>
      <div
        style={{
          width: 52,
          flexShrink: 0,
          fontSize: 12.5,
          color: 'var(--fg-4)',
          fontWeight: 500,
          marginTop: multiline ? 1 : 0,
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          fontSize: 13.5,
          color: 'var(--fg-2)',
          lineHeight: multiline ? 1.55 : 1.2,
        }}
      >
        {value}
      </div>
    </div>
  )
}

// ── 일정 상세 패널 ───────────────────────────────────────
export function EventDetail({
  ev,
  onClose,
  onDelete,
}: {
  ev: CalEvent
  onClose: () => void
  onDelete: (id: string) => void
}) {
  const meta = CATS[ev.cat]
  const kind = meta.type
  // '2026-06-19' → '2026. 06. 19', endDate 는 'MM. DD' 로 (… ~ 06. 23)
  const dateStr =
    ev.date.replace(/-/g, '. ') +
    (ev.endDate ? ` ~ ${ev.endDate.slice(5).replace('-', '. ')}` : '') +
    (ev.time ? `  ${ev.time}` : '')

  const footer =
    kind === 'tax' ? (
      <button
        className="btn btn-primary"
        onClick={() => window.open('https://www.hometax.go.kr', '_blank', 'noopener')}
      >
        홈택스 바로가기
      </button>
    ) : (
      <>
        <button
          className="btn"
          style={{ color: 'var(--state-error)' }}
          onClick={() => onDelete(ev.id)}
        >
          <IcTrash size={15} color="var(--state-error)" /> 삭제
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn">
          <IcEdit size={15} /> 수정
        </button>
        <button className="btn btn-primary" onClick={onClose}>
          확인
        </button>
      </>
    )

  return (
    <div className="card" style={{ width: '100%', height: '100%', background: 'var(--bg-surface-1)', border: 'none', borderRadius: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          padding: '16px 18px 14px',
          borderBottom: '1px solid var(--border-2)',
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>일정 상세</div>
        <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={onClose} title="닫기">
          <IcClose size={18} />
        </button>
      </div>

      <div className="scroll" style={{ padding: '16px 18px', overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 13 }}>
          <CatBadge cat={ev.cat} />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: 11,
              fontWeight: 600,
              background: 'var(--bg-input)',
              color: 'var(--fg-3)',
            }}
          >
            {kind === 'tax' ? (
              <>
                <IcLock size={12} /> 읽기 전용 · 세무 일정
              </>
            ) : (
              <>
                <IcPin size={12} /> 내 일정
              </>
            )}
          </span>
        </div>

        <div
          style={{
            fontSize: 21,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
            marginBottom: 14,
            color: 'var(--fg)',
          }}
        >
          {ev.title}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, paddingBottom: 4 }}>
          <DetailRow icon={<IcClock size={16} color="var(--fg-3)" />} label="일시" value={dateStr} />
          {kind === 'tax' ? (
            <>
              <DetailRow
                icon={<IcTag size={16} color="var(--fg-3)" />}
                label="신고 주기"
                value={ev.cycle ?? meta.label}
              />
              <DetailRow
                icon={<IcMemo size={16} color="var(--fg-3)" />}
                label="안내"
                value={ev.desc}
                multiline
              />
              <div
                style={{
                  marginTop: 4,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-input)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <IcBell size={17} color="var(--book-cloth)" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>이 일정 알림</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>1일 전 · 당일 오전 9시</div>
                  </div>
                </div>
                <div className="toggle on">
                  <i />
                </div>
              </div>
            </>
          ) : (
            <>
              <DetailRow icon={<IcBell size={16} color="var(--fg-3)" />} label="알림" value="1일 전" />
              <DetailRow
                icon={<IcMemo size={16} color="var(--fg-3)" />}
                label="메모"
                value={ev.desc}
                multiline
              />
            </>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '13px 18px',
          borderTop: '1px solid var(--border-2)',
          flexShrink: 0,
        }}
      >
        {footer}
      </div>
    </div>
  )
}
