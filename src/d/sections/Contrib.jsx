import { intro } from '../copy.js'
import Pool from '../components/Pool.jsx'
import Calendar from '../../shared/Calendar.jsx'

// 달력 칸이 왼쪽(1년 전)부터 밀물처럼 차오른다. 아직 데이터가 없으면 판 전체가 떠오른다.
function entrance(root, tl) {
  const cells = root.querySelectorAll('.calendar__day')
  if (cells.length) tl.from(cells, { opacity: 0, scaleY: 0.1, transformOrigin: '50% 100%', stagger: { amount: 1.1, from: 'start' }, duration: 0.5, ease: 'power2.out' }, 0.3)
  else tl.from(root.querySelector('.tide'), { opacity: 0, y: 16, duration: 0.7, ease: 'power3.out', clearProps: 'transform' }, 0.3)
  tl.from(root.querySelectorAll('.calendar__head, .calendar__months'), { opacity: 0, stagger: 0.1, duration: 0.6 }, 0.4)
}

export default function Contrib() {
  return (
    <Pool id="contrib" title="GitHub 활동 — 최근 1년" intro={intro.contrib} tone={1} entrance={entrance}>
      <div className="tide">
        <Calendar />
      </div>
    </Pool>
  )
}
