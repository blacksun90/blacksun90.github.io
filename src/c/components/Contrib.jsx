import Calendar from '../../shared/Calendar.jsx'
import { sections } from '../copy.js'
import Section from './Section.jsx'

export default function Contrib() {
  const s = sections.contrib
  return (
    <Section id={s.id} title={s.title} lead={s.lead}>
      <div className="contrib" data-reveal="up">
        <Calendar />
      </div>
    </Section>
  )
}
