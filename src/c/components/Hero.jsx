import { profile } from '../../content/site.js'
import { actions } from '../copy.js'

export default function Hero() {
  return (
    <section className="hero" id="top" aria-label="소개">
      <div className="wrap hero__in">
        <h1 className="hero__name" data-line>
          {profile.name}
        </h1>
        <p className="hero__role" data-line>
          {profile.role}
        </p>
        <p className="hero__tagline" data-line>
          {profile.tagline}
        </p>
        <div className="hero__intro" data-line>
          {profile.intro.map((s) => (
            <p key={s}>{s}</p>
          ))}
        </div>
        <div className="hero__actions" data-line>
          <a className="btn btn--primary" href={`mailto:${profile.email}`}>
            {actions.mail}
          </a>
        </div>
      </div>
    </section>
  )
}
