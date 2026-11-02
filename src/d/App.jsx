import { useEffect, useState } from 'react'
import Wash from './components/Wash.jsx'
import Surface from './components/Surface.jsx'
import SurfaceNav from './components/SurfaceNav.jsx'
import Career from './sections/Career.jsx'
import Projects from './sections/Projects.jsx'
import Method from './sections/Method.jsx'
import Personal from './sections/Personal.jsx'
import Contrib from './sections/Contrib.jsx'
import Contact from './sections/Contact.jsx'
import OverviewLink, { useOverviewReturn } from '../shared/OverviewLink.jsx'

export default function App() {
  useOverviewReturn('d')
  const [current, setCurrent] = useState('surface')

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <div className="water">
      <OverviewLink source="d" className="water-overview" />
      <Wash />
      <SurfaceNav current={current} />
      <main>
        <Surface onFlow={setCurrent} />
        <Career />
        <Projects />
        <Method />
        <Personal />
        <Contrib />
        <Contact />
      </main>
    </div>
  )
}
