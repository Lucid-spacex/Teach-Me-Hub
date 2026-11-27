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
- [ ] `/kids`: remove progress/dashboard and live-class screen imitations; use playful scenes and keep the 30-second quiz as a game, not an app screen.
- [ ] All pages: section eyebrow, specific headline with one italic gold accent, no more than two lines of body copy, responsive asymmetry, and clear privacy reassurance near actions.
- [ ] Check `/`, `/tutors`, and `/kids` at 390px, 820px, and 1440px in light and dark themes; fix overflow, clipping, contrast, and overlap.
- [ ] Verify reduced motion and the final file scope; do not change app behavior outside the public landing designs.

## Required checks

- [x] Homepage: `npm run build` and `npx tsc --noEmit` passed after the page rebuild.
- [x] `/tutors`: `npm run build` and `npx tsc --noEmit` passed after the page rebuild.
- [ ] `/kids`: run `npm run build` and `npx tsc --noEmit` after the page rebuild.
- [ ] Final responsive and theme verification across all three pages.

## Delivery order

1. [x] Homepage (`/`)
2. [x] Tutor landing (`/tutors`)
3. [ ] Children’s landing (`/kids`)
4. [ ] Responsive, theme, motion, accessibility, and scope pass

## Change notes

- Removed browser-frame and dashboard-preview components from the homepage composition.
- Replaced the parent hero with a geometric family-learning scene and kept the sample quiz interactive without saving data.
- The shared illustration file now contains original shape-based scenes, not dashboard mockups.
