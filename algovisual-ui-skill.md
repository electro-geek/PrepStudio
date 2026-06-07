# AlgoVizuals — UI Design System Document
## All Four UI Modes (Themes)

---

## Overview

AlgoVizuals uses a **CSS custom property–based theming system** where a single `data-theme` class on the `<html>` element switches the entire visual language. Four themes are available, each with a distinct personality, color palette, and mood — while sharing the same structural layout, spacing system, and component shapes.

**Shared Structural DNA (applies to all themes):**

- **Font — Headings:** DM Sans (`font-heading`, weight 800, tracking-tight)
- **Font — Body / UI:** System UI stack (`ui-sans-serif, system-ui, sans-serif`)
- **Font — Code:** System monospace stack (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`)
- **Base font size:** 16px / line-height 1.6
- **Border radius (cards, buttons, inputs):** 8px
- **Grid background pattern:** Thin repeating lines via `--paper-line` (low-opacity) + `--paper-wash` (color tint) — creates a hand-drawn notebook / graph-paper texture
- **Navbar:** `position: sticky; backdrop-filter: blur(12px)` — glass morphism header with `border-bottom: 1px solid var(--border)`
- **Transitions:** `transition-colors` (hover states), smooth easing on interactive elements
- **Spacing system:** Tailwind-compatible (4px base unit)

---

## Theme 1: 📄 Paper Lab
**Tagline:** *"Warm paper, ink text, cobalt notes, rust marks."*
**Mood:** A handwritten notebook on aged paper. Academic, warm, analog-feeling. High legibility, great for extended reading sessions.
**Class:** `.theme-paper-lab`

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--background` | `#f6efe3` | Main page background (warm parchment) |
| `--foreground` | `#1f2933` | Primary text (dark ink) |
| `--surface` | `#fffaf1` | Card / panel backgrounds (off-white cream) |
| `--surface-glass` | `rgba(255,250,241,0.88)` | Frosted-glass surfaces (navbar) |
| `--panel` | `#efe4d3` | Secondary panels, sidebar backgrounds |
| `--muted` | `#6f6659` | Muted/secondary text (warm gray-brown) |
| `--primary` | `#2457d6` | Actions, links, CTAs (cobalt blue) |
| `--primary-hover` | `#173fa7` | Hover state for primary (darker cobalt) |
| `--primary-soft` | `rgba(36,87,214,0.11)` | Soft primary tint (icon backgrounds) |
| `--secondary` | `#a94922` | Accent, tags, secondary highlights (rust/terracotta) |
| `--border` | `#d9c9b2` | Component borders (warm beige) |
| `--ring` | `#5b7fe6` | Focus ring (lighter cobalt) |
| `--paper-line` | `rgba(80,66,49,0.075)` | Grid background line tint |
| `--paper-wash` | `rgba(169,73,34,0.055)` | Grid background wash color |
| `--glow-primary` | `rgba(36,87,214,0.22)` | Primary element glow |
| `--shadow-glow-primary` | `0 8px 22px rgba(36,87,214,0.18)` | Card/button drop shadow |

### Visualization State Colors

| State | Background | Foreground | Border |
|---|---|---|---|
| **Current / Active** | `#2457d6` (cobalt) | `#ffffff` | `#173fa7` |
| **Success** | `#dcebd6` (soft green) | `#17432d` | `#8dbb91` |
| **Error** | `#f4d6cf` (blush pink) | `#7c1d1d` | `#d38b80` |
| **Compare** | `#f2dfbd` (wheat) | `#5f3513` | `#d6aa61` |
| **Swap** | `#ded7ec` (lavender) | `#35245f` | `#a79acc` |
| **Path** | `#dce6fb` (sky blue) | `#173766` | `#94acd8` |

### Component Anatomy

**Navbar:** White glass on warm parchment — `rgba(255,250,241,0.88)` + `blur(12px)` + `border-bottom: 1px solid #d9c9b2`

**Primary Button:** Solid cobalt `#2457d6`, white text, 8px radius, transitions to `#173fa7` on hover

**Ghost / Outline Button:** Transparent bg, cobalt text, `1px solid var(--border)`, hover fills with `--primary-soft`

**Cards:** `background: #fffaf1`, `border: 1px solid #d9c9b2`, `border-radius: 8px`, subtle shadow; hover lifts and shifts border to primary cobalt

**Tags / Badges:** Rounded pill (border-radius ~20px), rust-colored (`--secondary`) or muted gray, uppercase letter-spacing `0.14em`

**Difficulty Badges:** Easy = green; Medium = amber/orange; Hard = red — all on paper-warm backgrounds

**Search Input:** `background: --surface`, `border: 1px solid --border`, focus ring `--ring`

**Dropdown / Select:** Same surface treatment, `border: 1px solid --border`, chevron icon in foreground color

---

## Theme 2: 🌑 Graphite Lab *(Default)*
**Tagline:** *"Charcoal workspace, soft ivory text, teal signal."*
**Mood:** A professional dark-mode engineering workspace. Think VS Code meets Figma. Low-light friendly, serious, and data-forward.
**Class:** `.theme-graphite-lab`

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--background` | `#111513` | Main background (near-black charcoal) |
| `--foreground` | `#f2ead8` | Primary text (soft warm ivory) |
| `--surface` | `#191f1c` | Card surfaces (dark green-charcoal) |
| `--surface-glass` | `rgba(25,31,28,0.9)` | Glass navbar/overlay |
| `--panel` | `#202923` | Secondary panels, code blocks |
| `--muted` | `#b7ad98` | Muted text (warm stone gray) |
| `--primary` | `#32b8a6` | Actions, CTAs, active states (teal) |
| `--primary-hover` | `#53d1bd` | Hover — lighter/brighter teal |
| `--primary-soft` | `rgba(50,184,166,0.14)` | Soft teal tint (icon backgrounds) |
| `--secondary` | `#d99d43` | Accent — golden amber |
| `--border` | `#3a433b` | Component borders (dark sage) |
| `--ring` | `#73ddcf` | Focus ring (bright teal) |
| `--paper-line` | `hsla(42,50%,90%,0.065)` | Subtle grid lines |
| `--paper-wash` | `rgba(217,157,67,0.06)` | Amber-tinted grid wash |
| `--glow-primary` | `rgba(50,184,166,0.25)` | Teal glow on active elements |
| `--shadow-glow-primary` | `0 8px 24px rgba(50,184,166,0.18)` | Card glow shadow |

### Visualization State Colors

| State | Background | Foreground | Border |
|---|---|---|---|
| **Current / Active** | `#32b8a6` (teal) | `#081210` | `#73ddcf` |
| **Success** | `#214335` (deep green) | `#d9f7e5` | `#4f9f75` |
| **Error** | `#4d2623` (deep crimson) | `#ffd8d3` | `#c45d54` |
| **Compare** | `#4a3a21` (dark amber) | `#ffe5ad` | `#b8873e` |
| **Swap** | `#342d4e` (deep purple) | `#e8ddff` | `#8170bb` |
| **Path** | `#1d3b47` (dark teal-blue) | `#d6f6ff` | `#4b9db0` |

### Component Anatomy

**Navbar:** Deep charcoal glass — `rgba(25,31,28,0.9)` + `blur(12px)` + `border-bottom: 1px solid #3a433b`

**Primary Button:** Solid teal `#32b8a6`, very dark text (`#081210`), `border-radius: 8px`, brightens to `#53d1bd` on hover — gives a "glowing" feel

**Ghost / Outline Button:** Transparent bg, ivory text, `1px solid #3a433b`, hover shows teal soft tint

**Cards:** `background: rgba(25,31,28,0.9)`, `border: 1px solid #3a433b`, subtle green-dark shadow; hover border shifts to teal `--primary`

**Visualization Canvas:** Slightly lighter than card surface, `#202923`, to create depth hierarchy

**Code/Trace blocks:** Monospaced text in `--muted` (warm stone), inlined in surface-colored containers

**Tags / Badges (Sorting/Graph/etc.):** Small teal-tinted or purple-tinted capsules, uppercase, compact

**Difficulty Badges:** Easy = bright teal-green; Medium = amber; Hard = red-orange — all on dark transparent backgrounds

---

## Theme 3: 🌿 Sage Board
**Tagline:** *"Quiet green-gray boards with clay and blue ink."*
**Mood:** A calm, nature-inspired workspace. Like a school chalkboard meets botanical field notes. Softer and more relaxed than Paper Lab, more natural than Graphite.
**Class:** `.theme-sage-board`

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--background` | `#edf1e7` | Main background (pale sage green) |
| `--foreground` | `#17352a` | Primary text (deep forest green) |
| `--surface` | `#fbfcf5` | Card surfaces (near-white with green tint) |
| `--surface-glass` | `hsla(69,54%,97%,0.88)` | Glass overlays |
| `--panel` | `#dfe8d8` | Secondary panels (soft green-gray) |
| `--muted` | `#667568` | Muted text (medium sage) |
| `--primary` | `#2f67b1` | Actions, CTAs (slate blue / cobalt-blue) |
| `--primary-hover` | `#1f4f8c` | Deeper blue on hover |
| `--primary-soft` | `rgba(47,103,177,0.12)` | Soft blue tint |
| `--secondary` | `#9a6043` | Accent (clay/sienna) |
| `--border` | `#c6d1bd` | Component borders (light sage green) |
| `--ring` | `#6b93c8` | Focus ring (mid-blue) |
| `--paper-line` | `rgba(23,53,42,0.07)` | Dark-green subtle grid lines |
| `--paper-wash` | `rgba(154,96,67,0.055)` | Clay-tinted grid wash |
| `--glow-primary` | `rgba(47,103,177,0.20)` | Blue glow |
| `--shadow-glow-primary` | `0 8px 22px rgba(47,103,177,0.16)` | Card shadow |

### Visualization State Colors

| State | Background | Foreground | Border |
|---|---|---|---|
| **Current / Active** | `#2f67b1` (slate blue) | `#ffffff` | `#1f4f8c` |
| **Success** | `#d7e8d4` (soft mint) | `#17422c` | `#8ab58a` |
| **Error** | `#ecd5cd` (blush) | `#773020` | `#c28d7b` |
| **Compare** | `#eadcc6` (warm wheat) | `#5a3925` | `#bd9476` |
| **Swap** | `#d5e1d9` (mist green) | `#274c3b` | `--` |
| **Path** | Similar blue-tinted light | forest text | — |

### Component Anatomy

**Navbar:** Sage-green glass — `hsla(69,54%,97%,0.88)` + `blur(12px)` + green-tinted border

**Primary Button:** Solid slate-blue `#2f67b1`, white text — calm and measured, no aggressive brightness

**Cards:** `background: #fbfcf5` (barely off-white), `border: 1px solid #c6d1bd` (sage border), `border-radius: 8px` — feels like thick notecard paper

**Tags / Badges:** Clay (`--secondary`) secondary tags; blue primary action tags

**Overall feel:** The least saturated of the light themes — easy on the eyes for prolonged use, nature-referential

---

## Theme 4: ⚡ High Contrast
**Tagline:** *"Crisp accessible contrast with strong blue and orange."*
**Mood:** Maximum clarity. Accessibility-first design that still looks intentional. Pure white background, near-black text, electric blue primary, strong orange accent. Inspired by WCAG AAA and accessibility-forward products.
**Class:** `.theme-high-contrast`

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--background` | `#ffffff` | Main background (pure white) |
| `--foreground` | `#050505` | Primary text (near-black) |
| `--surface` | `#ffffff` | Card surfaces (also pure white) |
| `--surface-glass` | `hsla(0,0%,100%,0.96)` | Glass overlays |
| `--panel` | `#f0f0f0` | Secondary panels (light gray) |
| `--muted` | `#363636` | Muted text (dark gray — still very readable) |
| `--primary` | `#0048ff` | Actions, CTAs (electric royal blue) |
| `--primary-hover` | `#0032b8` | Deeper blue hover |
| `--primary-soft` | `rgba(0,72,255,0.12)` | Soft blue tint |
| `--secondary` | `#c74700` | Accent (burnt orange — strong contrast) |
| `--border` | `#111111` | Component borders (near-black — very visible) |
| `--ring` | `#0048ff` | Focus ring (same as primary — maximum visibility) |
| `--paper-line` | `rgba(0,0,0,0.12)` | Grid lines (black, semi-opaque) |
| `--paper-wash` | `rgba(199,71,0,0.055)` | Orange tinted grid wash |
| `--glow-primary` | `rgba(0,72,255,0.25)` | Blue glow |
| `--shadow-glow-primary` | `0 8px 22px rgba(0,72,255,0.18)` | Card shadow |

### Visualization State Colors

| State | Background | Foreground | Border |
|---|---|---|---|
| **Current / Active** | `#0048ff` (electric blue) | `#ffffff` | `#001a70` |
| **Success** | `#d8ffe8` (bright mint) | `#003b1f` | `#007a3d` |
| **Error** | `#ffe1dc` (bright pink-red) | `#760000` | `#bc1414` |
| **Compare** | `#ffe7c9` (bright peach) | `#562000` | `#c74700` |
| **Swap** | `#eadcff` (bright lavender) | `#25005f` | — |

### Component Anatomy

**Navbar:** Near-opaque white glass — `hsla(0,0%,100%,0.96)` + `blur(12px)` + `border-bottom: 1px solid #111`

**Primary Button:** Electric blue `#0048ff`, pure white text, `border-radius: 8px` — the highest contrast button of any theme. No ambiguity.

**Ghost / Outline Button:** Transparent bg, `#111111` border (much thicker visually than other themes), near-black text

**Cards:** Pure white `#ffffff`, `border: 1px solid #111` (strong, visible edge) — crisp and clinical

**Focus Ring:** Blue (`#0048ff`) — matches primary, easily spotted for keyboard navigation

**Tags / Badges:** Bold dark borders, orange (`--secondary`) or blue accents

**Overall feel:** This theme is not minimalist in a delicate sense — it's bold and clear. Great for users with visual impairments, high-ambient-light environments, or anyone who prefers maximum signal-to-noise.

---

## Cross-Theme: Shared Component Specifications

### Navigation Bar
```
position: sticky; top: 0; z-index: 50
height: ~56px
background: var(--surface-glass)
backdrop-filter: blur(12px)
border-bottom: 1px solid var(--border)
padding: 0 24px
```
Contains: Logo (left), nav links (left-center), streak counter + theme picker + avatar (right)

### Theme Picker Dropdown
A pill-shaped button showing the active theme icon + name + chevron. Opens a 4-item menu where each row shows: icon, label, description, 3 color swatches.

### Primary / CTA Button
```
background: var(--primary)
color: (dark for teal, white for cobalt/blue)
border-radius: 8px
padding: 8px 20px
font-weight: 600
transition: background-color 150ms ease
hover: var(--primary-hover)
```

### Outline / Ghost Button
```
background: transparent
border: 1px solid var(--border)
color: var(--foreground)
border-radius: 8px
padding: 8px 20px
hover: background var(--primary-soft)
```

### Card (Elevated)
```
background: var(--surface)
border: 1px solid var(--border)
border-radius: 8px
padding: 20px
transition: border-color 200ms
hover: border-color var(--primary)
```

### Table (Problem List)
```
header row: uppercase, 0.14em letter-spacing, var(--muted) color, small font
body rows: var(--foreground), border-bottom 1px solid var(--border)
hover row: background var(--panel)
status dots: circle icon, teal for solved
```

### Difficulty Badges
```
border-radius: 20px (pill)
padding: 2px 10px
font-size: 12px
font-weight: 600
Easy: green background / green text
Medium: amber/orange background / dark text  
Hard: red background / red text
```

### Algorithm Cards
```
background: var(--surface)
border: 1px solid var(--border)
border-radius: 8px
padding: 20px
Contains: Title, category badge (top-right), description, complexity note (monospace, var(--muted)), arrow icon (→)
hover: border-color var(--primary), arrow shifts right
```

### Category Label (Section Divider)
```
font-size: 14px
font-weight: 700
text-transform: uppercase
letter-spacing: 0.14em
color: var(--foreground)
border-bottom: 1px solid var(--border)
padding-bottom: 8px
margin-bottom: 16px
```

### Section Stat Blocks (100 / 10+ / 5 / DSA)
```
background: var(--surface)
border: 1px solid var(--border)
border-radius: 8px
padding: 24px
Large number: ~48px, font-weight 700, var(--foreground)
Label: uppercase, var(--muted), 12px, tracking-wide
```

### Visualization Window (Trace UI)
```
background: var(--surface)
border: 1px solid var(--border)
border-radius: 8px
Title bar: monospace text (trace://...) + 3 colored dots (amber, teal, red)
Array elements: rounded squares with active = var(--viz-current-bg)
Progress bar: thin 2px line var(--secondary) color
Data cells below: small cards with var(--panel) bg
```

### Background Grid Pattern
All themes use a **repeating grid pattern** as the page background, created by layering:
- `background-color: var(--background)` (base color)
- Overlaid with a low-opacity grid using `--paper-line` (the grid lines) and `--paper-wash` (a subtle color bleed)
This creates the distinctive "graph paper / architect's notebook" texture that unifies all four themes visually.

---

## Design Principles to Carry Forward

**1. Purposeful muted defaults.** Primary actions pop; everything else recedes. Never more than 2 prominent colors visible at once.

**2. State vocabulary.** The visualization state system (current/success/error/compare/swap/path) is deeply considered — each state has a distinct hue family so they never need labels to be differentiated.

**3. Dark themes are NOT just inverted.** Graphite Lab uses warmer ivories (not cold white), deep green-blacks (not flat black), and a teal primary (rather than inverting the cobalt blue from Paper Lab). Each theme is crafted independently.

**4. Glass morphism nav.** All themes use `backdrop-filter: blur(12px)` on the sticky navbar — giving depth without a jarring hard edge.

**5. 8px radius everything.** Consistent `border-radius: 8px` across cards, buttons, inputs, and dropdowns. Pill-shape (20px+) reserved for badges and tags only.

**6. Uppercase section labels.** Category headers use `text-transform: uppercase` + wide letter-spacing to serve as structural wayfinding without needing large font sizes.

**7. Monospace complexity notation.** `time O(n²)` style annotations always appear in monospace font in a muted color — never competing with primary content.
