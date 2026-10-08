# SoundStream Base UI Components

This directory contains the atomic UI components for the SoundStream application. These components are designed to be reusable, accessible, and consistent.

## 🏗 Architecture

We follow an **Atomic Design** philosophy for our UI components:

- **Atoms**: Basic building blocks (Button, Text, Input, Spinner)
- **Molecules/Compounds**: Groups of atoms working together (FormField, Card, Modal)
- **Layout**: Structural components (Stack, Grid, Container)

### Folder Structure

```
components/ui/
├── layout/           # Structural components (Stack, Grid, etc.)
├── feedback/         # User feedback (Spinner, Progress, Alert)
├── data/             # Data display (Table, List, Avatar)
├── navigation/       # Navigation (Tabs, Link, Menu)
├── tokens.ts         # Design tokens (colors, spacing, etc.)
├── index.ts          # Barrel export for all components
└── [Component].tsx   # Individual component files
```

## 🎨 Design Tokens

All components should use tokens from `tokens.ts` instead of hardcoded values. This ensures consistency across the application.

```typescript
import { colors, spacing } from './tokens';

// Prefer using Tailwind classes that correspond to tokens
<div className="text-emerald-600 p-4" />
```

## 🔧 Common Component Patterns

### 1. Compound Components

Many of our complex components use the compound component pattern for maximum flexibility.

```tsx
<Modal isOpen={isOpen} onClose={close}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content goes here</Modal.Body>
  <Modal.Footer>
    <Button onClick={close}>Close</Button>
  </Modal.Footer>
</Modal>
```

### 2. Composition over Configuration

Prefer composing smaller components rather than creating one component with many props.

```tsx
// Avoid
<Card title="Hello" description="World" showFooter={true} />

// Prefer
<Card>
  <Card.Header>Hello</Card.Header>
  <Card.Body>World</Card.Body>
  <Card.Footer>Footer content</Card.Footer>
</Card>
```

### 3. Slot Pattern

Use the `leftIcon` and `rightIcon` props for adding icons to buttons or inputs.

```tsx
<Button leftIcon={<PlayIcon />}>Play Song</Button>
```

## 📚 Component Categories

### Typography

- `Text`: Multi-variant text component (body, caption, label).
- `Heading`: Semantic heading component (h1-h6).

### Actions

- `Button`: Primary action component with variants (primary, secondary, danger, ghost, link, outline).
- `IconButton`: For icon-only actions.
- `ButtonGroup`: To group related buttons.

### Forms

- `Input`, `TextArea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Slider`.
- `FormField`: Wrapper that adds labels and error messages.
- `Form`: Context wrapper for handling form state.

### Layout

- `Stack`: Vertical or horizontal flex container with gaps.
- `Grid`: CSS Grid wrapper.
- `Flex`: General flexbox wrapper.
- `Container`: Centered max-width container.
- `Divider`, `Spacer`, `Box`.

### Feedback

- `Spinner`: Loading indicator.
- `Progress`: Progress bar.
- `Skeleton`: Placeholder for loading content.
- `Alert`: Inline feedback messages.
- `Badge`: Status or count indicators.
- `Tooltip`: Contextual information on hover.

### Modals & Overlays

- `Modal`: Base dialog window.
- `Dialog`: Simplified modal for confirmations or alerts.
- `Drawer`: Side-sliding panel.
- `Menu`: Dropdown menu for actions.

### Data Display

- `Card`: Container for grouped content.
- `Avatar`: User profile image with fallback.
- `Image`: Enhanced image component with lazy loading.
- `Table`, `List`, `ListItem`.

## 🧪 Testing

Every UI component should have a corresponding `.test.tsx` file in the same directory. We use **Vitest** and **React Testing Library**.

```bash
# Run UI component tests
npm run test src/components/ui
```

## ⌨️ Accessibility (A11y)

- All interactive elements must be keyboard accessible.
- Use appropriate ARIA roles and attributes.
- Ensure sufficient color contrast.
- Use `aria-label` for icon-only buttons.
