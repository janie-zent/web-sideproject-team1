'use client'

import { useEffect, useRef, useState } from 'react'
import { Popup } from './settings/Popup'
import type { CalEvent } from './data'
import { IcBell } from './icons'
import { Toggle } from './components/Toggle'

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<CalEvent, 'id' | 'cat' | 'done'>) => void
}

type NotificationTime = 'day-of' | '1day-before' | '3days-before' | '1week-before'

const notificationLabels: Record<NotificationTime, string> = {
  'day-of': '당일',
  '1day-before': '1일 전',
  '3days-before': '3일 전',
  '1week-before': '1주 전',
}

const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00')
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[date.getDay()]
  return `${year}. ${month}. ${day} (${weekday})`
}

export function AddEventModal({ isOpen, onClose, onSave }: AddEventModalProps) {
  const [title, setTitle] = useState('')
  const [allday, setAllday] = useState(false)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [endTime, setEndTime] = useState('10:00')
  const [hasNotification, setHasNotification] = useState(true)
  const [notificationTime, setNotificationTime] = useState<NotificationTime>('day-of')
  const [memo, setMemo] = useState('')

  const titleRef = useRef<HTMLInputElement>(null)
  const startDateRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && titleRef.current) {
      titleRef.current.focus()
    }
  }, [isOpen])

  const handleSave = () => {
    if (!title.trim()) {
      alert('일정명을 입력해주세요.')
      return
    }

    const event: Omit<CalEvent, 'id' | 'cat' | 'done'> = {
      title: title.trim(),
      date: startDate,
      allday: allday || undefined,
      desc: memo,
      time: allday ? null : startTime,
    }

    if (allday) {
      event.endDate = endDate
    }

    onSave(event)
    handleClose()
  }

  const handleClose = () => {
    setTitle('')
    setAllday(false)
    const now = new Date().toISOString().split('T')[0]
    setStartDate(now)
    setStartTime('09:00')
    setEndDate(now)
    setEndTime('10:00')
    setHasNotification(true)
    setNotificationTime('day-of')
    setMemo('')
    onClose()
  }

  return (
    <Popup isOpen={isOpen} onClose={handleClose} title="일정 등록" subtitle="개인 일정을 추가합니다" position="center">
      <div className="add-event-container">

        {/* 제목 */}
        <div className="add-event-section">
          <label className="add-event-label">제목</label>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="분기 매출 정산"
            className="add-event-input"
          />
        </div>

        {/* 날짜·시간 */}
        <div className="add-event-section">
          <div className="add-event-label-with-toggle">
            <label className="add-event-label">날짜·시간</label>
            <Toggle checked={allday} onChange={setAllday} label="종일" />
          </div>

          <div className="add-event-datetime-row">
            <div className="add-event-date-field">
              <input
                ref={startDateRef}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onClick={() => startDateRef.current?.showPicker?.()}
                className="add-event-date-input"
              />
              <span className="add-event-date-text">{formatDateDisplay(startDate)}</span>
            </div>
            {!allday && (
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="add-event-time-input"
              />
            )}
          </div>
          <div className="add-event-datetime-row">
            <div className="add-event-date-field">
              <input
                ref={endDateRef}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                onClick={() => endDateRef.current?.showPicker?.()}
                className="add-event-date-input"
              />
              <span className="add-event-date-text">{formatDateDisplay(endDate)}</span>
            </div>
            {!allday && (
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="add-event-time-input"
              />
            )}
          </div>
        </div>

        {/* 알림 받기 */}
        <div className="add-event-section add-event-notification-section">
          <div className="add-event-label-with-toggle">
            <div className="add-event-notification-label">
              <span>알림 받기</span>
            </div>
            <Toggle checked={hasNotification} onChange={setHasNotification} />
          </div>

          {hasNotification && (
            <div className="add-event-notification-time">
              <label className="add-event-label">알림 시점</label>
              <div className="add-event-button-group">
                {Object.entries(notificationLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setNotificationTime(key as NotificationTime)}
                    className={`add-event-time-button ${notificationTime === key ? 'active' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 메모 */}
        <div className="add-event-section">
          <label className="add-event-label">메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="2분기 매출/매입 자료 정리 및 장부 마감"
            className="add-event-textarea"
          />
        </div>

        {/* 버튼 */}
        <div className="add-event-buttons">
          <button onClick={handleClose} className="add-event-cancel-btn">
            취소
          </button>
          <button onClick={handleSave} className="add-event-save-btn">
            저장
          </button>
        </div>
      </div>

      <style>{`
        .add-event-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }


        .add-event-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .add-event-notification-section {
          background: var(--bg-2);
          border-radius: 6px;
          gap: 12px;
        }

        .add-event-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--fg);
        }

        .add-event-input {
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          background: var(--bg);
          color: var(--fg);
          box-sizing: border-box;
        }

        .add-event-input::placeholder {
          color: var(--fg-3);
        }

        .add-event-label-with-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }


        .add-event-datetime-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .add-event-date-field {
          flex: 1;
          position: relative;
        }

        .add-event-date-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          margin: 0;
          padding: 0;
          border: none;
        }

        .add-event-date-text {
          display: block;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          background: var(--bg);
          color: var(--fg);
          cursor: pointer;
          user-select: none;
          transition: border-color 0.2s;
          pointer-events: none;
        }

        .add-event-date-field:hover .add-event-date-text {
          border-color: var(--border-strong);
        }

        .add-event-time-input {
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          background: var(--bg);
          color: var(--fg);
          box-sizing: border-box;
          max-width: 100px;
        }

        .add-event-time-input::-webkit-calendar-picker-indicator {
          display: none;
        }

        .add-event-time-separator {
          color: var(--fg-3);
          font-size: 12px;
        }

        .add-event-notification-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--fg);
        }

        .add-event-notification-time {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .add-event-button-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .add-event-time-button {
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          background: var(--bg);
          color: var(--fg);
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-event-time-button.active {
          border-color: var(--book-cloth);
          color: var(--book-cloth);
          background: var(--bg);
        }

        .add-event-textarea {
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          background: var(--bg);
          color: var(--fg);
          box-sizing: border-box;
          min-height: 100px;
          resize: vertical;
        }

        .add-event-textarea::placeholder {
          color: var(--fg-3);
        }

        .add-event-buttons {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .add-event-cancel-btn {
          padding: 8px 20px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          background: var(--bg);
          color: var(--fg);
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-event-cancel-btn:hover {
          background: var(--bg-2);
        }

        .add-event-save-btn {
          padding: 8px 20px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          background: var(--book-cloth);
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-event-save-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </Popup>
  )
}
