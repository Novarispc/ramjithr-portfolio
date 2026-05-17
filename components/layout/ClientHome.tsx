'use client'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import CareerTimeline from '@/components/sections/CareerTimeline'
import ImpactDashboard from '@/components/sections/ImpactDashboard'
import TechConstellation from '@/components/sections/TechConstellation'
import LifeTimeline from '@/components/sections/LifeTimeline'
import SpecialTrackers from '@/components/sections/SpecialTrackers'
import ImpossibleList from '@/components/sections/ImpossibleList'
import GlobalJourney from '@/components/sections/GlobalJourney'
import Education from '@/components/sections/Education'
import PersonalSide from '@/components/sections/PersonalSide'
import ContactCTA from '@/components/sections/ContactCTA'
import LoadingScreen from '@/components/ui/LoadingScreen'
import CursorGlow from '@/components/ui/CursorGlow'
import type { PageData } from '@/lib/public-data'

export default function ClientHome({ data }: { data: PageData }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <CursorGlow />
      <AnimatePresence>
        {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      </AnimatePresence>
      <main className="relative" style={{ visibility: loaded ? 'visible' : 'hidden' }}>
        <Navbar personal={data.personal} />
        <Hero personal={data.personal} stats={data.stats} rotatingChips={data.rotatingChips} />
        <CareerTimeline career={data.career} />
        <ImpactDashboard metrics={data.impactMetrics} />
        <TechConstellation skillCategories={data.skillCategories} />
        <LifeTimeline entries={data.timeline} />
        <SpecialTrackers languages={data.languages} />
        <ImpossibleList achievements={data.achievements} />
        <GlobalJourney journey={data.journey} />
        <Education education={data.education} certifications={data.certifications} />
        <PersonalSide interests={data.interests} funFacts={data.funFacts} />
        <ContactCTA personal={data.personal} />
        <Footer personal={data.personal} />
      </main>
    </>
  )
}
