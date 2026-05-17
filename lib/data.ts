// This file is deprecated.
//
// All portfolio content is now managed via the /admin dashboard and persisted to
// data/content.json. Public components receive their data via props from the
// server-side loader in lib/public-data.ts.
//
// Items the dashboard does not (yet) manage live in lib/static-data.ts.
//
// Re-exporting the type for any legacy consumer.
export type { TimelineCategoryType as TimelineCategory } from './content-schema'
