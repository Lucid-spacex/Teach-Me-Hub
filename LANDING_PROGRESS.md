# TeachMeNest public landing refresh

## Scope and guardrails

- [x] Work only on `/`, `/tutors`, and `/kids`; preserve auth, APIs, route paths, registration, dashboards, and existing behavior.
- [x] Keep the work on the feature branch. Do not push, merge, or deploy.
- [x] Use original international copy, no invented testimonials, prices, salaries, statistics, or awards; no admin-login links.
- [x] Respect both themes, reduced motion, keyboard access, and mobile layouts.

## Revision checklist

- [x] Homepage: remove dashboard carousel, faux grade/notification cards, browser-frame previews, and all other app-screen artwork.
- [x] Homepage: replace mockups with geometric family-learning scenes and a story-led parent journey.
- [x] Homepage: use concise, original family-first copy and a clear numbered path from signup to first class.
- [x] `/tutors`: remove the tabbed workspace and hero cards; use an illustrated tutor scene and an honest numbered application journey.
- [x] `/tutors`: show Register, Verify email, Complete application, Upload documents, Admin review, and Get matched, with a persistent “You are here” marker.
- [x] `/kids`: remove progress/dashboard and live-class screen imitations; use playful scenes and keep the 30-second quiz as a game, not an app screen.
- [x] Parent and tutor pages use a restrained gold headline accent, concise copy, privacy reassurance, and editorial layout; `/kids` keeps its child-friendly highlight and voice as requested.
- [x] Checked `/`, `/tutors`, and `/kids` at 390px, 820px, and 1440px in light and dark themes; no horizontal overflow or clipped hero content found.
- [x] Confirmed reduced-motion handling remains in place and changes stay scoped to public landing styles, components, and assets.

## Required checks

- [x] Homepage: `npm run build` and `npx tsc --noEmit` passed after the page rebuild.
- [x] `/tutors`: `npm run build` and `npx tsc --noEmit` passed after the page rebuild.
- [x] `/kids`: `npm run build` and `npx tsc --noEmit` passed after the page rebuild.
- [x] Final responsive and theme verification across all three pages.

## Delivery order

1. [x] Homepage (`/`)
2. [x] Tutor landing (`/tutors`)
3. [x] Children’s landing (`/kids`)
4. [x] Responsive, theme, motion, accessibility, and scope pass

## Change notes

- Removed browser-frame and dashboard-preview components from the homepage composition.
- Replaced the parent hero with a geometric family-learning scene and kept the sample quiz interactive without saving data.
- The shared illustration file now contains original shape-based scenes, not dashboard mockups.
- Parent and tutor heroes now use local editorial photography with theme-aware overlays; no remote image service is required.
