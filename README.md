# Slide Selector

A customizable slide selector web component with icon support and configurable options. Built with TypeScript and modern web standards.

## Demo

![Slide Selector Demo](https://raw.githubusercontent.com/netsi1964/slide-selector/main/demo/screenshot.png)

Try it out on CodePen: [Slide Selector Demo](https://codepen.io/netsi1964/full/xbbwrbR)

## Features

- Vertical slide selector with customizable steps
- Icon support using Font Awesome icons
- Configurable label placement (n, s, e, w, nw, ne, sw, se)
- Touch and mouse interaction support
- Smooth animations and transitions
- TypeScript support
- Customizable styling

## Installation

### NPM
```bash
npm install @netsi1964/slide-selector
```

### CDN
You can use the component directly from a CDN:

```html
<!-- Add Font Awesome for icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

<!-- Import the component -->
<script type="module">
  import { SlideSelector } from 'https://cdn.jsdelivr.net/npm/@netsi1964/slide-selector@1.0.2/+esm';
  
  // The component is automatically registered as 'slide-selector'
</script>

<!-- Use the component -->
<slide-selector
  steps='[
    {"value":"Empty","icon":"battery-empty"},
    {"value":"Low","icon":"battery-quarter"},
    {"value":"Medium","icon":"battery-half"},
    {"value":"High","icon":"battery-three-quarters"},
    {"value":"Full","icon":"battery-full"}
  ]'
  label-placement="e"
  show-icons="true"
  value="Medium">
</slide-selector>
```

### Deno
```typescript
import { SlideSelector } from "jsr:@netsi1964/slide-selector@1.0.2";
```

## Usage

```html
<slide-selector
  steps='[
    {"value":"Empty","icon":"battery-empty"},
    {"value":"Low","icon":"battery-quarter"},
    {"value":"Medium","icon":"battery-half"},
    {"value":"High","icon":"battery-three-quarters"},
    {"value":"Full","icon":"battery-full"}
  ]'
  label-placement="e"
  show-icons="true"
  value="Medium">
</slide-selector>
```

### Attributes

- `steps`: Array of step objects with `value` and `icon` properties
- `label-placement`: Position of the label (n, s, e, w, nw, ne, sw, se)
- `show-icons`: Whether to show icons (true/false)
- `value`: Initial selected value

### Events

- `change`: Fired when the selected value changes
- `start`: Fired when dragging starts
- `drag`: Fired during dragging
- `end`: Fired when dragging ends

### Styling

You can customize the appearance using CSS variables:

```css
slide-selector {
  --primary-color: #3b82f6;    /* Main color for active elements */
  --primary-hover: #2563eb;    /* Color for hover states */
  --thumb-size: 40px;          /* Size of the thumb element */
  --rail-width: 4px;           /* Width of the slider rail */
  height: 300px;               /* Height of the component */
  display: block;
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Release Procedure

To publish a new version of the package:

1. Update version numbers in both configuration files:
   ```bash
   # In package.json
   "version": "x.y.z"
   
   # In deno.json
   "version": "x.y.z"
   ```

2. Commit the version changes:
   ```bash
   git add package.json deno.json
   git commit -m "Bump version to x.y.z"
   git push
   ```

3. Create and push a new tag to trigger the JSR publication:
   ```bash
   git tag vx.y.z
   git push origin vx.y.z
   ```

4. The GitHub Action will automatically publish to JSR when the tag is pushed.

5. After JSR publication is successful, publish to npm:
   ```