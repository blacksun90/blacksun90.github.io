import { useEffect, useRef } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Experience from './components/Experience.jsx'
import Projects from './components/Projects.jsx'
import Method from './components/Method.jsx'
import Personal from './components/Personal.jsx'
import Contrib from './components/Contrib.jsx'
import Contact from './components/Contact.jsx'
import { entrance, reveals } from './motion.js'
import { labels } from './copy.js'
import { useOverviewReturn } from '../shared/OverviewLink.jsx'

export default function App() {
  useOverviewReturn('c')
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    const stopEntrance = entrance(root)
    const stopReveals = reveals(root)
    return () => {
      stopEntrance()
      stopReveals()
    }
  }, [])

  return (
    <div className="site" ref={ref}>
      <a className="skip" href="#main">
        {labels.skipToContent}
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Method />
        <Personal />
        <Contrib />
        <Contact />
      </main>
      <footer className="foot">
        <div className="wrap foot__in">
          <span>© 2026 한성용</span>
          <span>직접 설계하고 만들었어요 · React + Vite + GSAP</span>
        </div>
      </footer>
    </div>
  )
}
