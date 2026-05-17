// Static items not (yet) managed by the dashboard.
// To make these editable from /admin, extend lib/content-schema.ts.

export const ROTATING_CHIPS = [
  'Volvo Cars Corporation',
  'Freelancing & Consulting',
  'EV Validation',
  'AI in Automotive',
  'Test Automation',
  'pytest',
  'CAPL Scripting',
  'ADAS Testing',
  'AUTOSAR',
  'Functional Safety',
  'ISO 26262',
  'ISO 21434',
  'HIL / SIL / VIL',
  'CAN / LIN / Ethernet',
  'API Testing',
]

export const IMPACT_METRICS = [
  { value: 50,  suffix: '%', label: 'Manual Testing Reduction', description: 'Through automation initiatives' },
  { value: 15,  suffix: '%', label: 'Faster Test Cycles',       description: 'Optimized validation execution' },
  { value: 100, suffix: '%', label: 'On-Time Delivery',         description: 'Across major launches' },
  { value: 25,  suffix: '%', label: 'Faster Issue Resolution',  description: 'Better reporting workflows' },
  { value: 99,  suffix: '%', label: 'Test Coverage',            description: 'For PODS platform validation' },
  { value: 25,  suffix: '+', label: 'Critical Defects Found',   description: 'Before vehicle integration' },
]

export const PERSONAL_INTERESTS = [
  { name: 'Cricket',      icon: '🏏', description: 'Passionate player chasing a century' },
  { name: 'Reading',      icon: '📚', description: 'Tech, growth, biographies' },
  { name: 'Mentoring',    icon: '🎯', description: 'Helping engineers grow faster' },
  { name: 'Singing',      icon: '🎵', description: 'Music for balance and creativity' },
  { name: 'Gaming',       icon: '🎮', description: 'PS5 strategy & racing games' },
  { name: 'Multilingual', icon: '🌍', description: 'English, Malayalam, Tamil, Kannada, Hindi, Telugu' },
]

export const FUN_FACTS = [
  'Scored a fifty in an inter-company cricket match',
  'Attempting to learn his 7th language — currently at 6',
  'Can name every F1 World Champion since 1950',
  'Passionate about mentoring junior engineers',
  'Dreams of running a full marathon one day',
]
