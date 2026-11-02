import { useEffect, useState } from 'react'

// GitHub 활동 달력(contribution calendar). public/data/contributions.json 을 읽어 53주 × 7일 격자로 그린다.
// 사이트 문구는 '기여' 대신 '활동'을 쓴다(2026-10-29 사용자 결정 — 비공개 저장소라 오픈소스 기여로 오해될 수 있어서).
export default function Calendar() {
  const [data, setData] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    fetch(`${import.meta.env.BASE_URL}data/contributions.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => alive && setData(j))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  if (failed) {
    return (
      <p className="calendar__empty">
        활동 그래프를 불러오지 못했어요.
      </p>
    )
  }
  if (!data) return <div className="calendar" aria-hidden="true" />

  const days = data.days
  const first = new Date(days[0].date)
  // 첫 주의 빈칸(일요일 시작 기준)
  const pad = first.getDay()
  const cells = [...Array(pad).fill(null), ...days]
  const months = []
  let lastMonth = -1
  for (const d of days) {
    const m = new Date(d.date).getMonth()
    if (m !== lastMonth) {
      months.push(`${m + 1}월`)
      lastMonth = m
    }
  }

  return (
    <>
      <div className="calendar__head">
        <h3>GitHub 활동 · 최근 1년</h3>
        <span>{new Date(data.fetchedAt).toLocaleDateString('ko-KR')} 기준</span>
      </div>
      <div className="calendar" role="img" aria-label="최근 1년 GitHub 활동 달력">
        {cells.map((d, i) =>
          d ? (
            <span key={d.date} className="calendar__day" data-level={d.level} title={`${d.date} · ${d.count}회`} />
          ) : (
            <span key={`pad-${i}`} className="calendar__day" style={{ visibility: 'hidden' }} />
          ),
        )}
      </div>
      <div className="calendar__months" aria-hidden="true">
        {months.slice(-12).map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
    </>
  )
}
