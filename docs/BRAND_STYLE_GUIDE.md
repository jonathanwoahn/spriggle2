# Spriggle Brand Style Guide

## Brand Overview

**Spriggle** is an AI-powered audiobook platform that transforms beloved childhood classics into immersive audio experiences. We source book content from publishers via the Cashmere API, convert it to audio using AI voice engines, and provide usage analytics back to publishers.

### Mission
To reconnect people with the stories that shaped their childhood, making classic literature accessible through the magic of AI narration.

### Taglines
- "Where Childhood Favorites Find New Voices"
- "Rediscover the Stories That Made You"
- "Classic Tales, Reimagined"

---

## Brand Voice

### Tone
- **Warm and inviting** - like a bedtime story
- **Playful but not childish** - appeals to parents and kids alike
- **Nostalgic without being saccharine** - genuine, not forced
- **Approachable and friendly** - never corporate or stiff

### Writing Guidelines
- Use active voice
- Keep sentences conversational
- Evoke memories and emotions
- Avoid jargon and technical terms in user-facing copy
- Embrace wonder and imagination

### Example Copy

**Do:**
> "Remember the first time you got lost in a story? That feeling of magic when the words came alive? We're bringing that back."

**Don't:**
> "Our platform leverages cutting-edge AI technology to convert text-based content into audio format."

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Magic Purple | `#9966FF` | 153, 102, 255 | Primary brand color, CTAs, key UI elements |
| Magic Purple Light | `#C2A3FF` | 194, 163, 255 | Hover states, backgrounds |
| Magic Purple Dark | `#5C3D99` | 92, 61, 153 | Dark mode accents, shadows |

### Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Coral Joy | `#FF8866` | 255, 136, 102 | Secondary CTAs, highlights, warmth |
| Coral Joy Light | `#FFC1A3` | 255, 193, 163 | Backgrounds, cards |
| Coral Joy Dark | `#99523D` | 153, 82, 61 | Dark mode variants |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Adventure Teal | `#66FFE0` | 102, 255, 224 | Accents, success states, links |
| Sunny Yellow | `#FFEB66` | 255, 235, 102 | Highlights, badges, celebration |

### Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Warm Cream | `#FFFDF5` | 255, 253, 245 | Light mode background |
| Deep Purple Night | `#1A1625` | 26, 22, 37 | Dark mode background |
| Surface Light | `#FFFFFF` | 255, 255, 255 | Cards, modals (light mode) |
| Surface Dark | `#252033` | 37, 32, 51 | Cards, modals (dark mode) |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success | `#4CAF50` | Positive actions, confirmations |
| Warning | `#FF9800` | Alerts, cautions |
| Error | `#F44336` | Errors, destructive actions |
| Info | `#2196F3` | Informational messages |

### Gradients

| Name | Gradient | Usage |
|------|----------|-------|
| Playful | `linear-gradient(135deg, #9966FF 0%, #FF8866 50%, #66FFE0 100%)` | Hero backgrounds, featured sections |
| Magic | `linear-gradient(135deg, #9966FF 0%, #5C3D99 100%)` | AppBar, buttons |
| Sunset | `linear-gradient(135deg, #FF8866 0%, #FFEB66 100%)` | Highlights, cards |

---

## Typography

### Font Families

| Role | Font | Fallback | Weight |
|------|------|----------|--------|
| Headings | Fredoka One | cursive | 400-700 |
| Body | Nunito | sans-serif | 400-700 |

### Type Scale

| Element | Size (Desktop) | Size (Mobile) | Weight | Line Height |
|---------|---------------|---------------|--------|-------------|
| H1 | 3.5rem (56px) | 2.5rem (40px) | 700 | 1.2 |
| H2 | 2.5rem (40px) | 2rem (32px) | 700 | 1.3 |
| H3 | 2rem (32px) | 1.5rem (24px) | 600 | 1.4 |
| H4 | 1.5rem (24px) | 1.25rem (20px) | 600 | 1.4 |
| H5 | 1.25rem (20px) | 1.125rem (18px) | 600 | 1.5 |
| H6 | 1rem (16px) | 1rem (16px) | 600 | 1.5 |
| Body 1 | 1rem (16px) | 1rem (16px) | 400 | 1.6 |
| Body 2 | 0.875rem (14px) | 0.875rem (14px) | 400 | 1.6 |
| Caption | 0.75rem (12px) | 0.75rem (12px) | 400 | 1.4 |

### Usage Guidelines
- Use **Fredoka One** for all headings and display text
- Use **Nunito** for body copy, UI elements, and buttons
- Never use more than 3 heading levels on a single page
- Maintain generous line spacing for readability

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing, icon gaps |
| sm | 8px | Internal component spacing |
| md | 16px | Standard element spacing |
| lg | 24px | Section padding, card content |
| xl | 32px | Large gaps between elements |
| 2xl | 48px | Section separators |
| 3xl | 64px | Page sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 8px | Small elements, chips, badges |
| md | 16px | Default for cards, inputs |
| lg | 24px | Large cards, modals |
| xl | 32px | Feature cards, hero elements |
| full | 9999px | Pills, circular buttons |

---

## Shadows

### Light Mode

```css
/* Subtle */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

/* Medium (Cards) */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);

/* Elevated (Modals) */
box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);

/* Colored (Primary buttons) */
box-shadow: 0 4px 14px rgba(153, 102, 255, 0.25);
```

### Dark Mode

```css
/* Subtle */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

/* Medium (Cards) */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

/* Colored (Primary buttons) */
box-shadow: 0 4px 14px rgba(153, 102, 255, 0.5);
```

---

## Component Guidelines

### Buttons

**Primary Button**
- Background: Magic Purple (`#9966FF`)
- Text: White
- Border Radius: 24px (pill shape)
- Padding: 12px 24px
- Shadow: Colored glow
- Hover: Slight lift (translateY(-2px)), increased shadow

**Secondary Button**
- Background: Transparent
- Border: 2px solid Magic Purple
- Text: Magic Purple
- Same radius and padding as primary

**Tertiary/Ghost Button**
- Background: Transparent
- No border
- Text: Magic Purple
- Hover: Subtle background tint

### Cards

- Background: Surface color (white/dark surface)
- Border Radius: 24px
- Shadow: Medium
- Padding: 24px (lg)
- Hover: Subtle lift animation

### Form Inputs

- Border: 1px solid border color
- Border Radius: 16px
- Padding: 12px 16px
- Focus: Magic Purple ring/outline
- Error: Error color border + message

### Navigation

- AppBar: Magic gradient background
- Height: 64px
- Shadow: Colored glow
- Links: White text, subtle hover state

---

## Iconography

### Style Guidelines
- Use rounded, friendly icon styles
- Prefer outlined icons over filled for UI
- Use filled icons for emphasis or active states
- Maintain consistent stroke width (1.5-2px)

### Icon Libraries
- Primary: Lucide React (friendly, consistent)
- Secondary: Material Icons (for MUI integration)

### Sizes
- Small: 16px (inline text)
- Medium: 24px (default UI)
- Large: 32px (feature icons)
- XL: 48px (hero/marketing)

---

## Imagery Guidelines

### Photography Style
- Warm, soft lighting
- Cozy, intimate settings
- Focus on reading moments
- Parents and children together
- Natural, candid expressions

### Illustration Style
- Watercolor or soft digital illustration
- Whimsical, storybook aesthetic
- Warm purple and coral tones
- Floating books, stars, magical elements
- Avoid harsh lines or flat vector style

### Mood Keywords
- Magical
- Nostalgic
- Cozy
- Warm
- Inviting
- Playful

### Hero Image Concepts
- Floating books in a starry sky
- Child in a cozy reading nook
- Books transforming into magical creatures
- Tree with books as leaves
- Soft clouds with book silhouettes

---

## Animation Guidelines

### Principles
- Animations should feel magical and delightful
- Use ease-in-out timing for smooth motion
- Keep durations short (150-300ms for UI, up to 3s for decorative)
- Prefer subtle over dramatic

### Common Animations

**Float**
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
animation: float 3s ease-in-out infinite;
```

**Wiggle**
```css
@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
animation: wiggle 1s ease-in-out infinite;
```

**Hover Lift**
```css
transition: transform 0.2s ease, box-shadow 0.2s ease;
&:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(153, 102, 255, 0.35);
}
```

---

## Logo Usage

*Note: Logo assets to be created. Placeholder guidelines below.*

### Logo Versions
- **Primary**: Full wordmark "Spriggle" in Fredoka One
- **Icon**: Stylized "S" or book-related symbol
- **Horizontal**: Icon + wordmark side by side
- **Stacked**: Icon above wordmark

### Clear Space
- Minimum clear space: 1x height of the logo on all sides

### Minimum Sizes
- Digital: 24px height minimum
- Print: 0.5 inch height minimum

### Color Usage
- Primary: Magic Purple on light backgrounds
- Reversed: White on dark/purple backgrounds
- Never: Coral, teal, or yellow as primary logo color

---

## Accessibility

### Color Contrast
- All text must meet WCAG 2.1 AA standards
- Primary text on backgrounds: minimum 4.5:1 contrast ratio
- Large text (18px+): minimum 3:1 contrast ratio

### Focus States
- All interactive elements must have visible focus indicators
- Use Magic Purple ring for focus states
- Never remove focus outlines

### Motion
- Respect `prefers-reduced-motion` preference
- Provide option to disable decorative animations

---

## Implementation Quick Reference

### CSS Variables (for globals.css)
```css
:root {
  --primary: #9966FF;
  --primary-light: #C2A3FF;
  --primary-dark: #5C3D99;
  --secondary: #FF8866;
  --accent: #66FFE0;
  --tertiary: #FFEB66;
  --background: #FFFDF5;
  --surface: #FFFFFF;
  --text-primary: #2D2640;
  --text-secondary: #6B5E80;
  --border-radius: 16px;
}
```

### MUI Theme Colors
```typescript
const palette = {
  primary: { main: '#9966FF' },
  secondary: { main: '#FF8866' },
  background: { default: '#FFFDF5', paper: '#FFFFFF' },
  text: { primary: '#2D2640', secondary: '#6B5E80' }
};
```

### Tailwind Classes
```
bg-spriggle-purple-500
text-spriggle-coral-500
border-spriggle-teal-500
bg-gradient-playful
rounded-2xl
shadow-colored
```

---

*Last updated: January 2025*
