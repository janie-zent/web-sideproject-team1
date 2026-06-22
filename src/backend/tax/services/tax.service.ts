// 세무 일정 비즈니스 로직 계층 (service)
// repository + shared만 import 한다. prisma 직접 호출 금지. 회원은 읽기전용.
import * as taxRepository from '../repositories/tax.repository'
import type { TaxSchedule, EventDto, CategoryKey } from '../tax.types'

// 월의 시작/끝 ISO 날짜 문자열을 계산한다. (사전식 문자열 비교용)
function monthRange(year: number, month: number): { start: string; end: string } {
  const monthLabel = String(month).padStart(2, '0')
  return {
    start: `${year}-${monthLabel}-01`,
    end: `${year}-${monthLabel}-31`,
  }
}

// 내부 엔티티(TaxSchedule)를 응답용 EventDto로 변환한다. 단일 변환 지점.
// id는 't' 접두어를 붙여 개인 일정과 충돌하지 않도록 한다. 세무 일정은 편집 불가.
function toDto(schedule: TaxSchedule): EventDto {
  return {
    id: `t${schedule.id}`,
    source: 'tax',
    cat: schedule.cat as CategoryKey,
    title: schedule.title,
    // startDate는 findByMonth에서 null이 아닌 것만 조회되지만, 타입 안정성을 위해 빈 문자열로 방어한다.
    startDate: schedule.startDate ?? '',
    endDate: schedule.endDate,
    time: null,
    allday: true,
    done: false,
    desc: `${schedule.cycle} · ${schedule.period}`,
    editable: false,
  }
}

// 해당 월의 세무 일정(읽기전용) 목록 조회 — EventDto 형태로 반환
export async function listByMonth(year: number, month: number): Promise<EventDto[]> {
  const { start, end } = monthRange(year, month)
  const schedules = await taxRepository.findByMonth(start, end)
  return schedules.map(toDto)
}
