# Design Document - EB Garamond Font Integration

## Overview

This design outlines the implementation of EB Garamond font integration to replace the current Gothic/dark-fantasy font theme (Cinzel, UnifrakturCook, Orbitron) with the elegant serif typeface EB Garamond. The change will provide a more refined and readable typography experience while maintaining performance and accessibility standards.

## Architecture

### Current Font System
- **Primary fonts**: Cinzel (serif), UnifrakturCook (decorative), Orbitron (sans-serif)
- **Loading method**: Google Fonts via CSS link with preconnect optimization
- **Usage**: Cinzel is used for splash screen title, other fonts appear unused in current CSS
- **Fallbacks**: System defaults through browser font stack

### New Font System
- **Primary font**: EB Garamond (serif) from Google Fonts
- **Loading method**: Google Fonts API with preconnect and font-display optimization
- **Font weights**: 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold)
- **Font styles**: Normal and italic variants
- **Fallbacks**: Georgia, Times New Roman, serif

## Components and Interfaces

### Font Loading Interface
```html
<!-- Updated Google Fonts link -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
```

### CSS Font Stack Configuration
```css
:root {
  --font-primary: 'EB Garamond', Georgia, 'Times New Roman', serif;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Typography System
- **Base font**: Applied to body and root elements
- **Headings**: Use EB Garamond with appropriate weights (600-700)
- **Body text**: EB Garamond regular (400) and medium (500)
- **UI elements**: Consistent EB Garamond application across buttons, panels, and interactive elements

## Data Models

### Font Configuration Object
```typescript
interface FontConfig {
  family: string;
  weights: number[];
  styles: ('normal' | 'italic')[];
  fallbacks: string[];
  displayStrategy: 'swap' | 'fallback' | 'optional';
}

const ebGaramondConfig: FontConfig = {
  family: 'EB Garamond',
  weights: [400, 500, 600, 700],
  styles: ['normal', 'italic'],
  fallbacks: ['Georgia', 'Times New Roman', 'serif'],
  displayStrategy: 'swap'
};
```

## Error Handling

### Font Loading Failures
- **Fallback fonts**: Graceful degradation to Georgia and system serif fonts
- **Loading timeout**: Use font-display: swap for immediate fallback rendering
- **Network issues**: Preconnect optimization reduces connection overhead
- **Cache strategy**: Browser caching handles subsequent visits

### Performance Considerations
- **Font subsetting**: Google Fonts automatically provides optimized subsets
- **Preloading**: Critical font weights preloaded for faster rendering
- **FOUT mitigation**: font-display: swap prevents invisible text during font load

## Testing Strategy

### Visual Regression Testing
- **Component screenshots**: Capture before/after states of key UI components
- **Cross-browser testing**: Verify font rendering across Chrome, Firefox, Safari, Edge
- **Device testing**: Test on mobile, tablet, and desktop viewports

### Performance Testing
- **Load time measurement**: Compare font loading performance before/after
- **Core Web Vitals**: Monitor CLS (Cumulative Layout Shift) during font swaps
- **Network throttling**: Test font loading on slow connections

### Accessibility Testing
- **Readability assessment**: Verify text remains readable at various sizes
- **Contrast validation**: Ensure font maintains adequate contrast ratios
- **Screen reader compatibility**: Test with assistive technologies

### Implementation Areas
1. **HTML head section**: Update Google Fonts link
2. **CSS root variables**: Define EB Garamond font stack
3. **Global typography**: Apply to body and base elements
4. **Component-specific styles**: Update splash screen, game panels, buttons
5. **Responsive typography**: Ensure proper scaling across breakpoints

## Migration Strategy

### Phase 1: Font Loading Setup
- Update HTML head with EB Garamond Google Fonts link
- Add CSS custom properties for font configuration
- Implement fallback font stack

### Phase 2: Global Typography Application
- Apply EB Garamond to body and root elements
- Update base typography classes and utilities
- Ensure consistent font weight usage

### Phase 3: Component-Specific Updates
- Update splash screen typography (currently using Cinzel)
- Apply to game information panels and UI elements
- Verify button and interactive element typography

### Phase 4: Optimization and Testing
- Implement font preloading for critical weights
- Conduct cross-browser and device testing
- Performance optimization and validation
