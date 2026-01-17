# Spriggle Brand & Style Guide

## Brand Identity

**Spriggle** is a children's audiobook platform that brings childhood classics to life with AI-powered narration. The brand is warm, playful, and magical—evoking the wonder of storytelling.

**Tagline**: "Where Childhood Favorites Find New Voices"

---

## Color Palette

### Primary Colors
- **Purple**: `#9966FF` - Primary brand color, used in gradients and accents
- **Coral/Orange**: `#FF8866` - Secondary brand color, warm accent

### Signature Gradient
```css
background: linear-gradient(135deg, #9966FF 0%, #FF8866 100%);
```

### UI Colors
- **White**: `#FFFFFF` - Page backgrounds, cards
- **Text Dark**: `#1a1a2e` - Primary text
- **Text Muted**: `rgba(0, 0, 0, 0.6)` - Secondary text

### Sparkle/Star Colors
- Yellow: `#FFEB66`
- Gold: `#FFD700`
- White: `#FFFFFF`
- Pale yellow: `#FFF5CC`
- Moccasin: `#FFE4B5`

---

## Typography

**Font Family**: Inter (Google Fonts)
- Clean, modern sans-serif
- Configured in `app/layout.tsx`

**Heading Sizes** (responsive):
- H1: `2.5rem` (mobile) → `3.5rem` (desktop)
- H2: `2rem` → `2.5rem`
- Body: `1rem`

---

## Hero Section

Location: `components/hero/`

The hero features an animated illustration with floating books and twinkling sparkles.

### Architecture
```
components/hero/
├── index.tsx           # Main hero container
├── hero-canvas.tsx     # Animated books + sparkles orchestrator
├── hero-content.tsx    # Text overlay (headline, CTA buttons)
├── floating-book.tsx   # Individual animated book component
└── sparkles.tsx        # Twinkling star particles
```

### Book Assets
Located in `public/`:
- `book_1.png`, `book_2.png`, `book_3.png`, `book_4.png`
- Watercolor book illustrations with transparent backgrounds
- Warm color palette (cream, beige, coral tones)

### Animation Library
Uses **Framer Motion** for:
- Floating sine-wave motion on books
- Mouse parallax effect (books move with cursor based on depth)
- Hover glow effects (golden glow)
- Twinkling sparkle animations with mouse proximity reactions

### Responsive Behavior

**Desktop (≥768px)**:
- Books positioned on right side (centered around 70%)
- Text content on left (max 50% width)
- Sparkles biased to right side (80% right, 20% left)

**Mobile (<768px)**:
- Books in upper 40% of hero
- Text at bottom with padding
- Sparkles only in top 55% (avoid text area)
- Smaller book sizes

### Book Configuration
```typescript
// Desktop: main large book with smaller satellites
{ src: "/book_1.png", width: 320, x: "70%", y: "50%", depth: 1.0 }

// Mobile: centered in upper area
{ src: "/book_1.png", width: 200, x: "50%", y: "25%", depth: 1.0 }
```

**Depth** controls parallax intensity (0-1, higher = more movement)

---

## Navigation

Location: `components/top-nav/`

- **Position**: Sticky at top
- **Background**: Translucent with backdrop blur
  ```css
  background: linear-gradient(135deg, rgba(153, 102, 255, 0.85) 0%, rgba(122, 82, 204, 0.85) 100%);
  backdrop-filter: blur(12px);
  ```
- **Text/Icons**: White
- **Shadow**: `0 4px 20px rgba(153, 102, 255, 0.2)`

---

## Homepage Sections

Location: `components/home/`

1. **Hero** - Animated books, sparkles, headline + CTA buttons
2. **ValueProps** - Three value proposition cards with icons
3. **CollectionsSection** - Book collection carousels
4. **QuoteSection** - Testimonial/quote block
5. **CTASection** - Final call-to-action

---

## Component Patterns

### Buttons

**Primary CTA** (on gradient backgrounds):
```tsx
<Button sx={{
  bgcolor: "white",
  color: "#9966FF",
  fontWeight: 600,
  borderRadius: 3,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
}}>
```

**Secondary/Outlined** (on gradient backgrounds):
```tsx
<Button variant="outlined" sx={{
  color: "white",
  borderColor: "rgba(255, 255, 255, 0.5)",
  borderWidth: 2,
}}>
```

### Cards
- Background: White
- Shadow: `0 4px 20px rgba(0, 0, 0, 0.1)`
- Border radius: `borderRadius: 3` (24px in MUI)
- Padding: `p: 4` typical

### Hover Effects
- Scale: `transform: scale(1.02)` or `translateY(-2px)`
- Shadow increase on lift
- Transition: `all 0.2s ease-in-out`

### Book Hover (in hero)
- Golden glow: `drop-shadow(0 0 20px rgba(255, 235, 100, 0.6))`
- Scale: 1.1x
- Sparkles nearby brighten and pulse faster

---

## Accessibility

- **Reduced Motion**: Respects `prefers-reduced-motion` media query
  - Disables floating animations
  - Disables parallax
  - Static sparkles
- **Contrast**: White text on gradient with text-shadow for readability
- **Semantic HTML**: Proper heading hierarchy, landmarks

---

## Image Assets Guidelines

- **Style**: Watercolor illustration
- **Format**: PNG with transparent backgrounds
- **Colors**: Warm palette (cream, beige, tan for books; gold for accents)
- **Extraction**: Clean edges, no background artifacts

---

## Tech Stack for Styling

- **Material-UI (MUI)**: Primary component library
- **Framer Motion**: Animations
- **Tailwind CSS**: Utility classes (minimal use)
- **Theme**: Light mode only (no dark mode)
