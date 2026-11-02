// AI 활용률을 작은 수위계로. 큰 숫자 타일이 아니라 물이 찬 높이.
export default function Level({ value, label = 'AI 활용' }) {
  return (
    <div className="level" role="img" aria-label={`${label} ${value}%`}>
      <span className="level__tube" aria-hidden="true">
        <span className="level__water" style={{ height: `${value}%` }} />
      </span>
      <span className="level__text" aria-hidden="true">
        <strong>{value}%</strong>
        <small>{label}</small>
      </span>
    </div>
  )
}
