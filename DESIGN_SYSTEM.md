# TeachMeNest Design System

## Direction

Warm editorial learning platform: calm cream surfaces, precise charcoal contrast, confident gold brand accents, and quiet role-specific colors. Prefer clear hierarchy and useful whitespace over ornament. Existing product copy and workflow meaning stay unchanged.

## Color tokens

All UI colors are semantic CSS variables in `app/globals.css`; use Tailwind utilities such as `bg-background`, `bg-card`, `text-foreground`, `border-border`, and the status tokens rather than hard-coded grays.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| Background | `#F7F5EF` | `#141512` | App canvas |
| Foreground | `#1D1E1A` | `#F1EFE7` | Primary text |
| Card | `#FFFDF8` | `#1D1E1A` | Elevated panels |
| Primary | `#E3B52F` | `#EBC85E` | Brand / action |
| Muted | `#F0EEE6` | `#252620` | Quiet panels |
| Muted foreground | `#68675F` | `#B7B4A8` | Secondary text |
| Border | `#E4E0D5` | `#383932` | Dividers / fields |
| Success | `#25735A` | `#72C3A1` | Positive status |
| Warning | `#A96E11` | `#F0C267` | Pending status |
| Info | `#4D638E` | `#A3B5E5` | Scheduled / information |
| Teal | `#26736D` | `#78C8BC` | Parent role |
| Indigo | `#5964A5` | `#AFB8F1` | Supporting charts |
| Purple | `#6556A5` | `#B8A9F7` | Student role |
| Coral | `#B65D4B` | `#E99A88` | Warm accent |
| Destructive | `#B5473C` | `#D16C5D` | Errors / rejected |

Role roots set `data-role="parent|tutor|student|admin"` to use teal, blue, purple, and gold accents respectively. Contrast-safe foregrounds are derived for light and dark themes.

## Typography

- Body and UI: DM Sans via `next/font/google`, `--font-body`.
- Display headings: DM Serif Display via `next/font/google`, `--font-display-family`.
- Dashboard `h1` scales from 30px to 44px, `h2` 24px to 36px, and `h3` 18px to 24px. Use balanced line lengths and avoid changing user-facing copy.
- Body copy uses a readable 16px base and relaxed line height.

## Shape, spacing, and surfaces

- Base radius: 12px (`--radius: 0.75rem`); buttons/inputs use the `rounded-xl` scale, cards use `rounded-2xl`, and split dialogs use a 24px outer radius.
- Use the existing four-pixel Tailwind spacing scale, responsive `clamp()` page gutters, and flexbox for one-dimensional layouts.
- Cards use semantic card surfaces, a quiet border, and `--shadow-soft`; glass is reserved for overlays and hero details.
- Dashboard content is width-constrained, `min-width: 0`, and padded responsively so route content cannot force horizontal page scrolling.

## Interaction and accessibility

- Primary controls have a minimum 44px touch target, visible focus rings, and clear hover/pressed states.
- Statuses use `success`, `warning`, `info`, or `destructive` badges with text labels; color is not the only status cue.
- Tables become labeled stacked cards below the desktop breakpoint; larger screens retain the tabular view.
- Shared dialogs use a two-pane editorial layout on larger screens and a safe-area-aware bottom sheet on small screens. The content pane owns its scroll region.
- Page and dialog transitions use the existing `motion` package and honor reduced-motion preferences. Loading skeletons shimmer; toast progress follows its Radix duration and pauses on hover/focus.
- Images retain meaningful alternative text. Icon-only controls expose accessible labels.

## Responsive breakpoints

- Mobile: below 640px; single-column content and full-width controls.
- Tablet: 640px–1279px; dashboard navigation becomes a drawer, forms and cards collapse gracefully, and content receives fluid gutters.
- Desktop: 1280px and up; persistent dashboard sidebar and wider data tables.
- Check 375px, 768px, 1024px, and 1388px viewports; preserve desktop as the default preview size.
