# Slide Selector

A customizable slide selector web component with icon support and configurable options. Built with TypeScript and modern web standards.

## Features

- Vertical slide selector with customizable steps
- Icon support using Font Awesome icons
- Configurable label placement (n, s, e, w, nw, ne, sw, se)
- Touch and mouse interaction support
- Smooth animations and transitions
- TypeScript support
- Customizable styling

## Installation

```bash
npm install @netsi1964/slide-selector
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

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## License

MIT