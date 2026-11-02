// 섹션 틀: 제목 + 안내문 한 줄 + 본문. 제목은 스크롤 진입 때 올라온다.
export default function Section({ id, title, lead, children, className = '' }) {
  return (
    <section className={`section ${className}`.trim()} id={id} aria-labelledby={`${id}-title`}>
      <div className="wrap">
        <div className="section__head" data-reveal="up">
          <h2 id={`${id}-title`}>{title}</h2>
          {lead && <p className="section__lead">{lead}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}
