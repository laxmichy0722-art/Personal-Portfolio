import { About } from './components/About'
import { Contact } from './components/Contact'
import { Cursor } from './components/Cursor'
import { Footer } from './components/Footer'
import { GraphicGallery } from './components/GraphicGallery'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { Preloader } from './components/Preloader'
import { Process } from './components/Process'
import { Services } from './components/Services'
import { Skills } from './components/Skills'
import { WebShowcase } from './components/WebShowcase'
import { Works } from './components/Works'

export default function App() {
  return (
    <>
      <Preloader />
      <Cursor />
      <div className="grain" aria-hidden />

      <Navbar />

      <main>
        <Hero />
        <About />
        <Services />
        <Works />
        <GraphicGallery />
        <WebShowcase />
        <Process />
        <Skills />
        <Contact />
      </main>

      <Footer />
    </>
  )
}