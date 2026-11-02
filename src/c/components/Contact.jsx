import { profile } from '../../content/site.js'
import { actions, sections } from '../copy.js'

export default function Contact() {
  const s = sections.contact
  return (
    <section className="section contact" id={s.id} aria-labelledby="contact-title">
      <div className="wrap contact__in" data-reveal="up">
        <h2 id="contact-title">{s.title}</h2>
        <p className="contact__lead">{s.lead}</p>
        <div className="contact__actions">
          <a className="btn btn--primary btn--large" href={`mailto:${profile.email}`}>
            {actions.mail}
          </a>
          <a className="contact__mail" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </div>
      </div>
    </section>
  )
}
