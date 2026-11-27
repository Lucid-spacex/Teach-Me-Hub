# TeachMeNest public landing page delivery

## Scope

Rebuild only the public parent homepage (`/`), tutor recruitment page (`/tutors`), and child-facing page (`/kids`). Preserve auth, API, registration, and dashboard behavior. Keep every change local to this feature branch; do not push, merge, or deploy.

## Delivery sequence

- [x] 1. Create the shared public shell, navigation, footer, theme-aware layout helpers, and reusable illustrations.
- [x] 2. Rebuild the parent homepage with its story, learning approach, feature tour, quiz, testimonials, FAQ, and conversion paths.
- [x] 3. Rebuild the tutor recruitment page with its role-specific proposition, benefits, sample schedule, application steps, requirements, FAQ, and conversion paths.
- [ ] 4. Create the child-facing `/kids` page with age-appropriate explanations, safety promises, a mini-quiz, caregiver handoff, and the existing student-login route.
- [ ] 5. Verify desktop/mobile, keyboard navigation, focus visibility, reduced motion, theme support, contrast, and responsive behavior; check the final change list against the scope restrictions.

For each numbered delivery item: run `npx tsc --noEmit` and `npm run build`, inspect the diff and scope, then create a descriptive local commit. No commit from this delivery is to be pushed.
