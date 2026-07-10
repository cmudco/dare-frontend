import React from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Democratization from './components/Democratization'
import Timeline from './components/Timeline'
import ActionFramework from './components/ActionFramework'
import Capabilities from './components/Capabilities'
import ProductTour from './components/ProductTour'
import Audiences from './components/Audiences'
import Adoption from './components/Adoption'
import Footer from './components/Footer'

/**
 * Public marketing landing page for DARE.
 *
 * Composed from focused, single-responsibility sections — each lives in its
 * own file under ./components so they can be reordered, swapped, or rewritten
 * independently. Theming (light/dark) flows from the app's design tokens
 * (bg-background / text-foreground / border-border / text-dare), so the page
 * follows the global theme toggle with no bespoke colour handling.
 */
export const LandingPage: React.FC = () => {
  return (
    <div className='min-h-screen scroll-smooth bg-background font-sans text-foreground antialiased'>
      <Nav />
      <main>
        <Hero />
        <Democratization />
        <ProductTour />
        <Timeline />
        <ActionFramework />
        <Capabilities />
        <Audiences />
        <Adoption />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
