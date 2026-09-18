---
name: accessibility
description: Accessibility best practices for React components — WCAG 2.1 AA compliance, ARIA patterns, keyboard navigation, color contrast, and screen reader support.
applyTo:
  - "frontend/src/**"
---

# Accessibility Skill

## Core Principles

1. **Perceivable** — All UI elements must be visible and audible to all users
2. **Operable** — All functionality must be available via keyboard
3. **Understandable** — Content and UI must be clear and predictable
4. **Robust** — Content must be interpretable by assistive technologies

## WCAG 2.1 AA Compliance

### Color Contrast
- **Text**: Minimum 4.5:1 contrast ratio (normal text), 3:1 (large text ≥18px)
- **UI Components**: Minimum 3:1 contrast ratio against adjacent colors
- Use tools: Chrome DevTools > Rendering > Contrast ratio

### Keyboard Navigation
- All interactive elements must be focusable
- Use `tabIndex={0}` for custom interactive elements
- Implement logical tab order (visual flow)
- Provide visible focus indicators:
  ```tsx
  // Good: visible focus ring
  <button className="focus:ring-2 focus:ring-blue-500 focus:outline-none">

  // Bad: removing focus outline
  <button className="outline-none">  // ❌ Don't do this
  ```

### Skip Navigation
```tsx
// Add skip link at top of page
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

## ARIA Patterns

### Live Regions (Dynamic Content)
```tsx
// For KPI cards that update
<div aria-live="polite" aria-atomic="true">
  <span>Total Income: {formatCurrency(value)}</span>
</div>

// For loading states
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? 'Loading...' : content}
</div>
```

### Semantic HTML First
```tsx
// Good: semantic elements
<header>, <nav>, <main>, <aside>, <footer>
<table>, <thead>, <tbody>, <th scope="col">
<button>, <a>, <input>, <label>

// Avoid: divs for everything
<div onClick={handleClick}>Click me</div>  // ❌ Use <button>
```

### Labels and Descriptions
```tsx
// Form inputs
<label htmlFor="date-filter">Filter by date</label>
<input id="date-filter" type="date" />

// Charts (Recharts)
<LineChart aria-label="Monthly income vs outcome comparison">
  <Line aria-label="Income" />
  <Line aria-label="Outcome" />
</LineChart>
```

### Tables
```tsx
<table>
  <caption>Monthly Financial Summary</caption>
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Income</th>
      <th scope="col">Outcome</th>
    </tr>
  </thead>
  <tbody>...</tbody>
</table>
```

## Component Checklist

For each new component, verify:

- [ ] All images have `alt` text (or `alt=""` for decorative)
- [ ] Interactive elements are keyboard accessible
- [ ] Focus management is handled correctly
- [ ] Color is not the only way to convey information
- [ ] Text alternatives exist for icons
- [ ] Form inputs have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Loading states use `aria-busy` and `aria-live`
- [ ] Charts have text alternatives or data tables

## Testing

```bash
# Install axe-core for automated testing
npm install @axe-core/react

# Add to development mode only
if (import.meta.env.DEV) {
  import('axe-core').then(axe => {
    axe.default.run();
  });
}
```

### Manual Testing Checklist
1. Navigate entire UI using only Tab/Shift+Tab/Enter/Space/Arrow keys
2. Test with screen reader (VoiceOver on Mac, NVDA on Windows)
3. Zoom to 200% — content should still be readable
4. Test with Windows High Contrast Mode
5. Verify skip navigation link works correctly
