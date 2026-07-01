---
name: Lumina Leadership
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e5'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fe'
  surface-container: '#ecedf9'
  surface-container-high: '#e6e8f3'
  surface-container-highest: '#e0e2ed'
  on-surface: '#181c23'
  on-surface-variant: '#414755'
  inverse-surface: '#2d3039'
  inverse-on-surface: '#eef0fc'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#525f71'
  on-secondary: '#ffffff'
  secondary-container: '#d3e1f6'
  on-secondary-container: '#566475'
  tertiary: '#595c5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#727577'
  on-tertiary-container: '#fbfdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#d6e4f9'
  secondary-fixed-dim: '#bac8dc'
  on-secondary-fixed: '#0f1c2c'
  on-secondary-fixed-variant: '#3a4859'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f9f9ff'
  on-background: '#181c23'
  surface-variant: '#e0e2ed'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is engineered for clarity, focus, and momentum. It targets senior executives and high-level coaches who require information density without cognitive overload. The brand personality is **authoritative yet approachable**, blending the precision of a data-driven tool with the warmth of human-centric development.

The visual style is **refined minimalism**. It leverages high-key lighting, expansive whitespace, and a dynamic "energy" color to signify progress and growth. By stripping away non-functional decorative elements, the design system ensures that the assessment data and behavioral insights remain the primary focus, fostering an environment of calm reflection and decisive action.

## Colors

The palette is anchored by **Vibrant Blue**, used strategically to draw attention to primary actions and progress indicators. The background is a crisp, clean white to maximize readability and provide a sense of openness.

- **Primary:** A high-saturation blue that conveys energy and modern professionalism.
- **Secondary:** A deep navy used for high-level navigation and deep-contrast text.
- **Surface:** Subtle off-white/gray tints are used for background grounding to prevent "snow blindness" on large monitors.
- **Status:** Semantically clear green and orange are reserved strictly for assessment results and feedback urgency, ensuring they never compete with the primary brand color.

## Typography

This design system utilizes **Inter** exclusively to maintain a systematic and utilitarian feel. The hierarchy is established through significant weight shifts and generous leading. 

Headlines utilize tight letter-spacing and heavy weights to create a sense of grounded authority. Body text is optimized for long-form reading during deep-dive assessment reviews, with increased line height. Labels use a slightly heavier weight and occasional uppercase styling to distinguish metadata from content.

## Layout & Spacing

The layout follows a **fluid grid system** with a maximum content width to preserve readability on ultra-wide monitors. A strict 8px spacing scale governs all spatial relationships.

- **Desktop:** 12-column grid with 24px gutters. Sidebars are fixed at 280px, while the main content area remains fluid.
- **Tablet:** 8-column grid with 20px gutters. Margins reduce to 32px.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Content is organized in "stacks" to maintain vertical rhythm. Vertical spacing between logical sections (e.g., different assessment categories) should favor larger gaps (48px+) to reinforce the minimalist aesthetic.

## Elevation & Depth

To maintain the minimalist and "bright" character, depth is primarily conveyed through **tonal layering and soft, ambient shadows**.

- **Level 0 (Base):** White background (#FFFFFF).
- **Level 1 (Cards/Sections):** Subtle 1px border (#E2E8F0) with no shadow, or a very faint 4% opacity shadow for interactive elements.
- **Level 2 (Dropdowns/Modals):** High-diffusion shadows (20px-30px blur) with 8% opacity to create a "floating" effect without appearing heavy.
- **Active State:** Elements may use a subtle inner-glow or a thicker 2px primary-colored border to indicate focus, rather than increasing shadow depth.

## Shapes

The shape language is consistently **Rounded**, striking a balance between professional geometry and friendly approachability. 

- **Standard Elements (Buttons, Inputs):** 8px (0.5rem) radius.
- **Containers (Cards, Modals):** 16px (1rem) radius.
- **Small Elements (Tags, Badges):** 4px (0.25rem) or fully pill-shaped depending on the density of the data visualization nearby.

## Components

### Buttons
Primary buttons use the vibrant blue background with white text. Hover states shift the blue to a slightly darker shade. Secondary buttons use a ghost style (1px border) to maintain the minimalist "light" feel.

### Cards
Cards are the primary container for assessment modules. They feature a white background, the standard 16px corner radius, and a subtle light-gray border. Padding inside cards should be generous (min 32px) to prevent data from feeling cramped.

### Input Fields
Inputs use a 1px border (#E2E8F0) that transitions to the Primary Blue on focus. Labels sit clearly above the field in `label-md` styling.

### Progress Indicators
Linear progress bars for assessment completion use a thick 8px track. The track is a light gray (#F1F5F9) and the fill is the Primary Blue. For "Success" milestones, the fill may transition to the Success Green.

### Charts & Data
Visualizations should use a simplified color palette. Data points are rounded. Grid lines in charts should be kept to a minimum and colored with very low-contrast grays to keep the UI clean.