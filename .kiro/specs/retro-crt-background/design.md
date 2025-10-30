# Design Document

## Overview

The retro CRT background system will replace the current static background image with a dynamic, CSS-based visual effect that simulates an old computer terminal or CRT monitor. The design focuses on performance, visual authenticity, and seamless integration with the existing game UI.

## Architecture

### Component Structure
```
CRT Background System
├── Base Layer (solid black background)
├── Static Grid Layer (horizontal terminal lines)
├── Animated Scanline Layer (moving scan effect)
├── Vignette Layer (edge darkening)
└── Phosphor Glow Layer (green tint overlay)
```

### Integration Points
- **Current Background**: Replace the existing `backgroundImage: 'url("/background.jpg")'` in App.tsx
- **CSS Integration**: Add new CRT-specific styles to index.css
- **Layout Compatibility**: Ensure compatibility with existing `.layout-background` class

## Components and Interfaces

### 1. CRT Background Component
**Purpose**: Main container that orchestrates all visual layers

**Implementation Approach**:
- Pure CSS solution using multiple layered div elements
- Positioned absolutely to cover the entire viewport
- Uses CSS custom properties for easy customization

**Key Properties**:
```css
.crt-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: #000;
  overflow: hidden;
}
```

### 2. Static Grid Layer
**Purpose**: Creates the illusion of terminal text rows

**Visual Characteristics**:
- Horizontal lines spaced evenly across the screen
- Subtle green tint (#0f0) with low opacity (10-15%)
- Line height: 2-4px with 2-4px spacing between lines
- Uses CSS `repeating-linear-gradient` for performance

### 3. Animated Scanline Layer
**Purpose**: Moving horizontal line that simulates CRT scanning

**Animation Specifications**:
- Single scanline element (1-2px height)
- Travels from top (0%) to bottom (100%) of screen
- Animation duration: 3 seconds for smooth, noticeable movement
- Uses CSS `@keyframes` with `linear` timing function
- Gradient effect: transparent → bright green → transparent

**CSS Implementation**:
```css
@keyframes crt-scanline {
  0% { top: 0%; }
  100% { top: 100%; }
}
```

### 4. Vignette Effect
**Purpose**: Darkens screen edges to simulate CRT monitor characteristics

**Visual Properties**:
- Radial gradient from center to edges
- Inner area: transparent
- Outer area: semi-transparent black (rgba(0,0,0,0.3-0.5))
- Applied using CSS `box-shadow` inset technique

### 5. Phosphor Glow Layer
**Purpose**: Adds subtle green tint to simulate phosphor monitor glow

**Implementation**:
- Semi-transparent overlay with green tint
- Very low opacity (5-10%) to avoid color interference
- Applied as a pseudo-element or overlay div

## Data Models

### CSS Custom Properties
```css
:root {
  --crt-scanline-speed: 3s;
  --crt-scanline-opacity: 0.3;
  --crt-grid-opacity: 0.12;
  --crt-grid-spacing: 4px;
  --crt-vignette-strength: 0.4;
  --crt-phosphor-opacity: 0.08;
  --crt-green: #0f0;
}
```

### Responsive Breakpoints
- **Mobile (≤480px)**: Reduced animation complexity, larger grid spacing
- **Tablet (≤768px)**: Standard effects with optimized performance
- **Desktop (>768px)**: Full effects with maximum visual fidelity

## Error Handling

### Performance Fallbacks
1. **Low-end devices**: Disable animations, keep static effects only
2. **Reduced motion preference**: Respect `prefers-reduced-motion` media query
3. **Browser compatibility**: Provide fallback for older browsers without CSS grid support

### Visual Fallbacks
1. **Animation failure**: Static grid remains visible
2. **CSS loading issues**: Falls back to solid black background
3. **Color profile issues**: Maintains readability with high contrast

## Testing Strategy

### Visual Testing
1. **Cross-browser compatibility**: Test in Chrome, Firefox, Safari, Edge
2. **Device testing**: Verify on mobile, tablet, and desktop viewports
3. **Performance testing**: Monitor frame rates during gameplay
4. **Accessibility testing**: Ensure effects don't trigger motion sensitivity

### Integration Testing
1. **UI overlay testing**: Verify game elements remain readable
2. **Z-index testing**: Confirm proper layering with existing elements
3. **Responsive testing**: Check behavior across all breakpoints

### Performance Benchmarks
- **Target**: Maintain 60fps on mid-range mobile devices
- **Memory usage**: No increase in baseline memory consumption
- **CPU usage**: Minimal impact on game logic performance

## Implementation Notes

### CSS Animation Optimization
- Use `transform` and `opacity` properties for hardware acceleration
- Avoid animating `width`, `height`, or `position` properties directly
- Leverage `will-change` property for elements that will be animated

### Mobile Considerations
- Reduce scanline count on smaller screens
- Simplify gradient effects for better performance
- Consider battery impact of continuous animations

### Accessibility Compliance
- Respect `prefers-reduced-motion` setting
- Maintain sufficient contrast ratios for UI elements
- Provide option to disable effects if needed

## Future Enhancements

### Potential Additions
1. **Multiple scanlines**: Add 2-3 scanlines with different speeds
2. **Flicker effects**: Occasional screen flicker for authenticity
3. **Color variations**: Support for amber or white phosphor themes
4. **Intensity controls**: User preference for effect strength
