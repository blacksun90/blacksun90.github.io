import { useEffect, useRef } from 'react'
import { profile, stats, companies, career, personal, aiMethod, projectsByCompany, education } from '../../content/site.js'
import Calendar from '../Calendar.jsx'
import { gsap } from '../gsap.js'
import { usersOfSkill } from './graph.js'

const REDUCED = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const years = (period) => period.replace(/\.\d{2}/g, '').replace('현재', '').trim()

// 오른쪽 패널. 노드 종류마다 그리는 법이 다르다. 내용은 전부 site.js 에서.
export default function Panel({ node, onSelect, onClose }) {
  const ref = useRef(null)
  const headRef = useRef(null)

  useEffect(() => {
    if (!node || !ref.current) return
    const el = ref.current
    if (REDUCED()) gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    else gsap.fromTo(el, { x: 28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'expo.out', clearProps: 'transform' })
    headRef.current?.focus({ preventScroll: true })
  }, [node?.id])

  if (!node) return null
  const Go = ({ id, children, className = 'panel__link' }) => (
    <button type="button" className={className} onClick={() => onSelect(id)}>
      {children}
    </button>
  )
  const Chips = ({ items }) => (
    <ul className="panel__chips" aria-label="기술">
      {items.map((s) => (
        <li key={s}>
          <Go id={`skill:${s}`} className="panel__chip">
            {s}
          </Go>
        </li>
      ))}
    </ul>
  )

  let kicker = ''
  let title = node.label
  let body = null

  if (node.type === 'person') {
    kicker = profile.role
    body = (
      <>
        <p className="panel__lead">{profile.tagline}</p>
        <ul className="panel__tally">
          {stats.map((s) => (
            <li key={s.id}>
              <strong>
                {s.value}
                {s.unit}
              </strong>{' '}
              {s.label}
            </li>
          ))}
        </ul>
        {profile.intro.map((s) => (
          <p key={s} className="panel__p">
            {s}
          </p>
        ))}
        <h3>둘러보기</h3>
        <ul className="panel__nav">
          {companies.slice(0, 1).map((c) => (
            <li key={c.id}>
              <Go id={`company:${c.id}`}>경력 — {c.name}부터</Go>
            </li>
          ))}
          <li>
            <Go id="project:bi-console">프로젝트 — BI 콘솔</Go>
          </li>
          <li>
            <Go id="ai">AI와 일하는 방식</Go>
          </li>
          <li>
            <Go id="rd">R&D · 개인 프로젝트</Go>
          </li>
          <li>
            <Go id="activity">GitHub 활동</Go>
          </li>
          <li>
            <Go id="contact">연락</Go>
          </li>
        </ul>
        <p className="panel__hint">그래프의 점을 눌러도 같은 내용이 열려요. 선으로 이어진 점이 관련 있는 것들이에요.</p>
      </>
    )
  } else if (node.type === 'company') {
    const c = career.find((x) => x.id === node.ref.id) || node.ref // companies 목록엔 이름·기간만 있고 역할·항목은 career 에
    kicker = `${c.role} · ${c.period}`
    body = (
      <>
        {c.sub && <p className="panel__sub">{c.sub}</p>}
        <ul className="panel__bullets">
          {c.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <h3>여기서 만든 것</h3>
        <ul className="panel__nav">
          {projectsByCompany(c.id).map((p) => (
            <li key={p.id}>
              <Go id={`project:${p.id}`}>
                {p.title} <span>{p.line}</span>
              </Go>
            </li>
          ))}
        </ul>
        {c.id === companies[companies.length - 1].id && (
          <>
            <h3>학력</h3>
            <ul className="panel__bullets">
              {education.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </>
        )}
      </>
    )
  } else if (node.type === 'project' || node.type === 'personal') {
    const p = node.ref
    const org = node.type === 'project' ? companies.find((c) => c.id === p.company) : null
    kicker = [org?.name, p.period, p.ai != null ? `AI 활용률 ${p.ai}%` : null].filter(Boolean).join(' · ')
    body = (
      <>
        <p className="panel__lead">{p.line}</p>
        <p className="panel__p">{p.detail}</p>
        {p.points && (
          <ul className="panel__bullets">
            {p.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        )}
        <h3>기술</h3>
        <Chips items={p.stack} />
        {org && (
          <p className="panel__hint">
            <Go id={`company:${org.id}`}>{org.name}의 다른 프로젝트 보기</Go>
          </p>
        )}
        {node.type === 'personal' && (
          <p className="panel__hint">
            <Go id="rd">다른 개인 프로젝트 보기</Go>
          </p>
        )}
      </>
    )
  } else if (node.type === 'skill') {
    const { inProjects, inPersonal } = usersOfSkill(node.label)
    kicker = '기술'
    body = (
      <>
        <p className="panel__lead">이 기술을 쓴 곳</p>
        <ul className="panel__nav">
          {inProjects.map((p) => (
            <li key={p.id}>
              <Go id={`project:${p.id}`}>
                {p.title} <span>{companies.find((c) => c.id === p.company)?.name}</span>
              </Go>
            </li>
          ))}
          {inPersonal.map((p) => (
            <li key={p.id}>
              <Go id={`personal:${p.id}`}>
                {p.title} <span>개인 프로젝트</span>
              </Go>
            </li>
          ))}
        </ul>
      </>
    )
  } else if (node.type === 'hub') {
    kicker = '퇴근 뒤의 것들 · 저장소는 비공개'
    body = (
      <ul className="panel__nav">
        {personal.map((p) => (
          <li key={p.id}>
            <Go id={`personal:${p.id}`}>
              {p.title} <span>{p.line}</span>
            </Go>
          </li>
        ))}
      </ul>
    )
  } else if (node.type === 'ai' || node.type === 'flow' || node.type === 'tool') {
    kicker = node.type === 'ai' ? '에이전트에게 맡기는 게 아니라, 일하는 체계를 문서로 만들어 둔 것' : node.type === 'flow' ? `작업 체계의 ${node.index + 1}단계 · ${node.note}` : node.ref.use
    body = (
      <>
        <h3>흐름</h3>
        <ol className="panel__flow">
          {aiMethod.flow.map((f, i) => (
            <li key={f} className={node.type === 'flow' && node.index === i ? 'is-here' : ''}>
              <Go id={`flow:${i}`}>
                {f} <span>{aiMethod.flowNotes[i]}</span>
              </Go>
            </li>
          ))}
        </ol>
        <h3>원칙</h3>
        <ol className="panel__bullets panel__bullets--num">
          {aiMethod.principles.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
        <h3>쓰는 도구</h3>
        <ul className="panel__nav">
          {aiMethod.tools.map((t) => (
            <li key={t.name}>
              <Go id={`tool:${t.name}`}>
                {t.name} <span>{t.use}</span>
              </Go>
            </li>
          ))}
        </ul>
      </>
    )
  } else if (node.type === 'activity') {
    kicker = '최근 1년, 날짜별 작업량 · 비공개 저장소의 활동도 개수만'
    body = (
      <div className="panel__calendar">
        <Calendar />
      </div>
    )
  } else if (node.type === 'contact') {
    kicker = '운영툴·BI·자동화, 그리고 AI와 함께 일하는 방식이 궁금하시면'
    body = (
      <>
        <a className="panel__mail" href={`mailto:${profile.email}`}>
          메일 보내기
        </a>
        <p className="panel__p">{profile.email}</p>
      </>
    )
  }

  return (
    <aside className="panel" ref={ref} aria-label="선택한 항목">
      <div className="panel__bar">
        <span className="panel__type">{labelOf(node)}</span>
        <button type="button" className="panel__close" onClick={onClose} aria-label="닫기">
          ×
        </button>
      </div>
      <h2 className="panel__title" tabIndex={-1} ref={headRef}>
        {title}
      </h2>
      {kicker && <p className="panel__kicker">{kicker}</p>}
      <div className="panel__body">{body}</div>
      {node.type !== 'person' && (
        <p className="panel__foot">
          <Go id="me">처음으로</Go> · {years(companies[0].period)} 기준
        </p>
      )}
    </aside>
  )
}

function labelOf(n) {
  return { person: '소개', company: '회사', project: '프로젝트', personal: '개인 프로젝트', skill: '기술', hub: 'R&D', ai: 'AI 방식', flow: 'AI 방식', tool: 'AI 도구', activity: '활동', contact: '연락' }[n.type] || ''
}
