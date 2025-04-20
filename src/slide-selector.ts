/**
 * A customizable vertical slide selector web component with icon support.
 * 
 * This component provides a vertical slider with customizable steps, each having a value and an associated icon.
 * It supports touch and mouse interactions, smooth animations, and configurable label placement.
 * 
 * @example Basic Usage
 * ```html
 * <slide-selector
 *   steps='[
 *     {"value": "Low", "icon": "volume-low"},
 *     {"value": "Medium", "icon": "volume-medium"},
 *     {"value": "High", "icon": "volume-high"}
 *   ]'
 *   label-placement="e"
 *   show-icons="true"
 *   value="Medium">
 * </slide-selector>
 * ```
 * 
 * @example Styling
 * ```css
 * slide-selector {
 *   --primary-color: #3b82f6;
 *   --primary-hover: #2563eb;
 *   --thumb-size: 40px;
 *   --rail-width: 4px;
 *   height: 300px;
 *   display: block;
 * }
 * ```
 * 
 * @example Event Handling
 * ```javascript
 * const selector = document.querySelector('slide-selector');
 * 
 * selector.addEventListener('change', (e) => {
 *   const { index, value, icon } = e.detail;
 *   console.log(`Selected: ${value} (${icon}) at index ${index}`);
 * });
 * 
 * selector.addEventListener('start', (e) => {
 *   console.log('Started dragging at index:', e.detail.index);
 * });
 * 
 * selector.addEventListener('drag', (e) => {
 *   console.log('Dragging at index:', e.detail.index);
 * });
 * 
 * selector.addEventListener('end', (e) => {
 *   console.log('Ended dragging at index:', e.detail.index);
 * });
 * ```
 * 
 * @example Different Label Placements
 * ```html
 * <!-- East placement (right) -->
 * <slide-selector label-placement="e"></slide-selector>
 * 
 * <!-- West placement (left) -->
 * <slide-selector label-placement="w"></slide-selector>
 * 
 * <!-- North placement (top) -->
 * <slide-selector label-placement="n"></slide-selector>
 * 
 * <!-- South placement (bottom) -->
 * <slide-selector label-placement="s"></slide-selector>
 * 
 * <!-- Corner placements -->
 * <slide-selector label-placement="ne"></slide-selector>
 * <slide-selector label-placement="nw"></slide-selector>
 * <slide-selector label-placement="se"></slide-selector>
 * <slide-selector label-placement="sw"></slide-selector>
 * ```
 * 
 * @module
 */

/**
 * Represents a single step in the slide selector.
 * Each step has a value and an associated Font Awesome icon name.
 * 
 * @example
 * ```javascript
 * const steps = [
 *   { value: "Empty", icon: "battery-empty" },
 *   { value: "Low", icon: "battery-quarter" },
 *   { value: "Medium", icon: "battery-half" },
 *   { value: "High", icon: "battery-three-quarters" },
 *   { value: "Full", icon: "battery-full" }
 * ];
 * ```
 */
interface Step {
  /** The text value displayed for this step */
  value: string;
  /** The Font Awesome icon name (without the fa- prefix) */
  icon: string;
}

/**
 * Interface for label positioning styles.
 * These styles are used to position and style the label that appears when hovering over steps.
 * The component uses these styles to create a consistent and attractive label appearance
 * across all label placement options.
 */
interface LabelPositionStyles {
  /** CSS position property */
  position: string;
  /** Background color */
  background: string;
  /** Text color */
  color: string;
  /** Padding around the label */
  padding: string;
  /** Border radius for rounded corners */
  borderRadius: string;
  /** Font size of the label text */
  fontSize: string;
  /** Font weight of the label text */
  fontWeight: string;
  /** Text wrapping behavior */
  whiteSpace: string;
  /** Opacity of the label */
  opacity: string;
  /** Transition effects */
  transition: string;
  /** Mouse event handling */
  pointerEvents: string;
  /** Z-index for stacking context */
  zIndex: string;
  /** Box shadow for depth effect */
  boxShadow: string;
  /** Border style */
  border: string;
  /** Allow for additional dynamic style properties */
  [key: string]: string;
}

/**
 * A customizable vertical slide selector implemented as a Web Component.
 * 
 * Features:
 * - Vertical slider with customizable steps
 * - Icon support using Font Awesome icons
 * - Configurable label placement (n, s, e, w, nw, ne, sw, se)
 * - Touch and mouse interaction support
 * - Smooth animations and transitions
 * - Customizable styling through CSS variables
 * 
 * CSS Variables:
 * - --primary-color: Main color for active elements (default: #3b82f6)
 * - --primary-hover: Color for hover states (default: #2563eb)
 * - --thumb-size: Size of the thumb element (default: 40px)
 * - --rail-width: Width of the slider rail (default: 4px)
 * 
 * @fires {CustomEvent} change - Fired when the selected value changes
 * @fires {CustomEvent} start - Fired when dragging starts
 * @fires {CustomEvent} drag - Fired during dragging
 * @fires {CustomEvent} end - Fired when dragging ends
 * 
 * Event Details:
 * - change: { index: number, value: string, icon: string }
 * - start: { index: number }
 * - drag: { index: number }
 * - end: { index: number }
 */
export class SlideSelector extends HTMLElement {
  // Private properties
  private steps: Step[];
  private labelPlacement: string;
  private showIcons: boolean;
  private value: string;
  private index: number;
  private dragging: boolean;
  private lastY: number;
  private velocity: number;
  private animationFrame: number | null;
  
  // DOM element references
  private thumb: HTMLElement | null;
  private label: HTMLElement | null;
  private rail: HTMLElement | null;
  private dots: NodeListOf<HTMLElement> | null;

  /**
   * Creates a new SlideSelector instance.
   * Initializes the shadow DOM and sets up initial properties.
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Parse attributes with type checking
    const stepsAttr = this.getAttribute("steps");
    this.steps = stepsAttr ? JSON.parse(stepsAttr) : [];
    this.labelPlacement = this.getAttribute("label-placement") || "e";
    this.showIcons = this.getAttribute("show-icons") === "true";
    this.value = this.getAttribute("value") || "";

    // Initialize index based on value or default to middle
    this.index = this.value ? 
      this.steps.findIndex(step => step.value === this.value) : 
      Math.floor(this.steps.length / 2);
    if (this.index === -1) this.index = Math.floor(this.steps.length / 2);

    // Initialize other properties
    this.dragging = false;
    this.lastY = 0;
    this.velocity = 0;
    this.animationFrame = null;
    this.thumb = null;
    this.label = null;
    this.rail = null;
    this.dots = null;

    // Bind methods to maintain context
    this.startDrag = this.startDrag.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.endDrag = this.endDrag.bind(this);
  }

  /**
   * List of attributes that trigger attributeChangedCallback when modified.
   * @returns {string[]} Array of attribute names to observe
   */
  static get observedAttributes(): string[] {
    return ['steps', 'label-placement', 'show-icons', 'value'];
  }

  /**
   * Handles changes to observed attributes.
   * @param {string} name - Name of the changed attribute
   * @param {string|null} oldValue - Previous value of the attribute
   * @param {string|null} newValue - New value of the attribute
   */
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'steps':
        if (newValue) {
          this.steps = JSON.parse(newValue);
          this.index = this.value ? 
            this.steps.findIndex(step => step.value === this.value) : 
            Math.floor(this.steps.length / 2);
          if (this.index === -1) this.index = Math.floor(this.steps.length / 2);
          this.render();
          this.reconnectEvents();
        }
        break;
      case 'label-placement':
        if (newValue) {
          this.labelPlacement = newValue;
          this.render();
        }
        break;
      case 'show-icons':
        this.showIcons = newValue === "true";
        this.render();
        break;
      case 'value':
        if (newValue) {
          this.value = newValue;
          const newIndex = this.steps.findIndex(step => step.value === newValue);
          if (newIndex !== -1 && newIndex !== this.index) {
            this.index = newIndex;
            this.render();
          }
        }
        break;
    }
  }

  /**
   * Called when the element is added to the document.
   * Sets up event listeners and initializes the component.
   */
  connectedCallback(): void {
    this.render();
    this.thumb = this.shadowRoot?.querySelector(".thumb") || null;
    this.label = this.shadowRoot?.querySelector(".label") || null;
    this.rail = this.shadowRoot?.querySelector(".rail") || null;
    this.dots = this.shadowRoot?.querySelectorAll(".dot") || null;
    this.addEventListeners();
    
    // Add resize observer
    new ResizeObserver(() => this.updateThumb()).observe(this);
    this.updateThumb();

    // Add click handlers for dots
    this.dots?.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.setIndex(index);
      });
    });
  }

  /**
   * Called when the element is removed from the document.
   * Cleans up event listeners.
   */
  disconnectedCallback(): void {
    this.removeEventListeners();
  }

  private addEventListeners(): void {
    if (!this.thumb) return;
    
    this.thumb.addEventListener("mousedown", this.startDrag);
    this.thumb.addEventListener("touchstart", this.startDrag, { passive: false });
    window.addEventListener("mousemove", this.onDrag);
    window.addEventListener("touchmove", this.onDrag, { passive: false });
    window.addEventListener("mouseup", this.endDrag);
    window.addEventListener("touchend", this.endDrag);
  }

  private removeEventListeners(): void {
    if (!this.thumb) return;

    this.thumb.removeEventListener("mousedown", this.startDrag);
    this.thumb.removeEventListener("touchstart", this.startDrag);
    window.removeEventListener("mousemove", this.onDrag);
    window.removeEventListener("touchmove", this.onDrag);
    window.removeEventListener("mouseup", this.endDrag);
    window.removeEventListener("touchend", this.endDrag);
  }

  private reconnectEvents(): void {
    this.removeEventListeners();
    this.thumb = this.shadowRoot?.querySelector(".thumb") || null;
    this.addEventListeners();
  }

  private getLabelPositionStyles(): LabelPositionStyles {
    const baseStyles: LabelPositionStyles = {
      position: 'absolute',
      background: 'white',
      color: 'var(--primary-color)',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      opacity: '0',
      transition: 'opacity 0.2s ease',
      pointerEvents: 'none',
      zIndex: '100',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    };

    const spacing = '12px';
    const positions: { [key: string]: { [key: string]: string } } = {
      n: {
        left: '50%',
        bottom: 'calc(100% + 8px)',
        transform: 'translateX(-50%)'
      },
      s: {
        left: '50%',
        top: 'calc(100% + 8px)',
        transform: 'translateX(-50%)'
      },
      e: {
        left: `calc(100% + ${spacing})`,
        top: '50%',
        transform: 'translateY(-50%)'
      },
      w: {
        right: `calc(100% + ${spacing})`,
        top: '50%',
        transform: 'translateY(-50%)'
      },
      nw: {
        right: `calc(100% + ${spacing})`,
        bottom: `calc(100% + ${spacing})`,
        transform: 'none'
      },
      ne: {
        left: `calc(100% + ${spacing})`,
        bottom: `calc(100% + ${spacing})`,
        transform: 'none'
      },
      sw: {
        right: `calc(100% + ${spacing})`,
        top: `calc(100% + ${spacing})`,
        transform: 'none'
      },
      se: {
        left: `calc(100% + ${spacing})`,
        top: `calc(100% + ${spacing})`,
        transform: 'none'
      }
    };

    const labelStyles: LabelPositionStyles = {
      ...baseStyles,
      ...(positions[this.labelPlacement.toLowerCase()] || positions.e)
    };

    return labelStyles;
  }

  private startDrag(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    this.dragging = true;
    this.thumb?.classList.add("dragging");
    this.lastY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
    this.velocity = 0;
    
    this.dispatchEvent(new CustomEvent("start", {
      detail: { index: this.index }
    }));
    
    document.body.style.userSelect = "none";
    document.body.style.touchAction = "none";
  }

  private onDrag(e: MouseEvent | TouchEvent): void {
    if (!this.dragging || !this.rail) return;
    e.preventDefault();
    
    const y = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
    this.velocity = y - this.lastY;
    this.lastY = y;
    
    const railRect = this.rail.getBoundingClientRect();
    let relativeY = y - railRect.top;
    relativeY = Math.max(0, Math.min(railRect.height, relativeY));
    
    const step = Math.round(relativeY / (railRect.height / (this.steps.length - 1)));
    if (step !== this.index) {
      this.index = step;
      this.updateThumb();
      this.dispatchEvent(new CustomEvent("drag", {
        detail: { index: this.index }
      }));
    }
  }

  private endDrag(): void {
    if (!this.dragging) return;
    
    this.dragging = false;
    this.thumb?.classList.remove("dragging");
    
    if (Math.abs(this.velocity) > 5) {
      const direction = this.velocity > 0 ? 1 : -1;
      const stepsToMove = Math.min(Math.floor(Math.abs(this.velocity) / 10), 2);
      this.setIndex(this.index + (direction * stepsToMove));
    }
    
    this.dispatchEvent(new CustomEvent("end", {
      detail: { index: this.index }
    }));
    
    document.body.style.userSelect = "";
    document.body.style.touchAction = "";
  }

  private updateThumb(): void {
    if (!this.rail || !this.thumb) return;
    
    const railRect = this.rail.getBoundingClientRect();
    const stepHeight = railRect.height / (this.steps.length - 1);
    const offset = stepHeight * this.index;
    this.thumb.style.top = `${offset + 20}px`;
    
    if (this.label) {
      this.label.textContent = this.steps[this.index]?.value || '';
    }

    // Update thumb icon
    const thumbIcon = this.shadowRoot?.querySelector('.thumb-icon');
    if (thumbIcon) {
      thumbIcon.className = `fas fa-${this.steps[this.index]?.icon} thumb-icon`;
    }

    // Update dots
    this.dots?.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.index);
      const dotIcon = dot.querySelector('.dot-icon');
      if (dotIcon) {
        dotIcon.className = `fas fa-${this.steps[i]?.icon} dot-icon`;
      }
    });

    this.dispatchEvent(new CustomEvent("change", {
      detail: {
        index: this.index,
        value: this.steps[this.index]?.value,
        icon: this.steps[this.index]?.icon
      }
    }));
  }

  /**
   * Sets the current index and updates the selector position.
   * @param {number} index - The index to set (0-based)
   */
  public setIndex(index: number): void {
    const newIndex = Math.max(0, Math.min(this.steps.length - 1, index));
    if (newIndex !== this.index) {
      this.index = newIndex;
      this.thumb?.classList.add('thumb-pulse');
      setTimeout(() => {
        this.thumb?.classList.remove('thumb-pulse');
      }, 1500);
      this.updateThumb();
    }
  }

  /**
   * Gets the current selected index.
   * @returns {number} The current index (0-based)
   */
  public getIndex(): number {
    return this.index;
  }

  /**
   * Gets the current selected value.
   * @returns {string} The value of the currently selected step
   */
  public getValue(): string {
    return this.steps[this.index]?.value || '';
  }

  /**
   * Gets the icon name of the current selected step.
   * @returns {string} The icon name of the currently selected step
   */
  public getIcon(): string {
    return this.steps[this.index]?.icon || '';
  }

  /**
   * Updates the steps configuration.
   * @param {Step[]} newSteps - Array of new step configurations
   */
  public setSteps(newSteps: Step[]): void {
    this.steps = newSteps;
    this.index = Math.floor(this.steps.length / 2);
    this.render();
  }

  /**
   * Sets the label placement position.
   * @param {string} placement - Position of the label (n, s, e, w, nw, ne, sw, se)
   */
  public setLabelPlacement(placement: string): void {
    this.labelPlacement = placement;
    this.setAttribute('label-placement', placement);
    this.render();
  }

  /**
   * Sets whether icons should be shown.
   * @param {boolean} show - Whether to show icons
   */
  public setShowIcons(show: boolean): void {
    this.showIcons = show;
    this.setAttribute('show-icons', show.toString());
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot) return;

    const style = `
      :host {
        --primary-color: #3b82f6;
        --primary-hover: #2563eb;
        --thumb-size: 40px;
        --rail-width: 4px;
        position: relative;
        display: inline-block;
        width: var(--thumb-size);
        min-height: 200px;
        user-select: none;
      }

      .rail {
        position: absolute;
        top: 20px;
        bottom: 20px;
        left: 50%;
        width: var(--rail-width);
        background: #e5e7eb;
        border-radius: 2px;
        transform: translateX(-50%);
      }

      .thumb {
        position: absolute;
        left: 50%;
        width: var(--thumb-size);
        height: var(--thumb-size);
        background: white;
        border: 2px solid var(--primary-color);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        transition: border-color 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .thumb:hover {
        border-color: var(--primary-hover);
      }

      .thumb.dragging {
        border-color: var(--primary-hover);
        background: var(--primary-hover);
        color: white;
      }

      .thumb-pulse {
        animation: pulse 1.5s infinite;
      }

      .label {
        position: absolute;
        background: white;
        color: var(--primary-color);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
        z-index: 100;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid #e5e7eb;
      }

      .thumb:hover + .label {
        opacity: 1;
      }

      .dots {
        position: absolute;
        top: 20px;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        pointer-events: none;
      }

      .dot {
        width: 8px;
        height: 8px;
        background: #e5e7eb;
        border-radius: 50%;
        transform: translateX(-50%);
        transition: background-color 0.2s ease;
        cursor: pointer;
        pointer-events: auto;
      }

      .dot:hover {
        background: var(--primary-hover);
      }

      .dot.active {
        background: var(--primary-color);
      }

      .dot-icon {
        display: none;
        font-size: 12px;
        color: #6b7280;
      }

      :host([show-icons="true"]) .dot-icon {
        display: inline-block;
      }

      @keyframes pulse {
        0%, 100% {
          transform: translate(-50%, -50%) scale(1);
        }
        50% {
          transform: translate(-50%, -50%) scale(1.05);
        }
      }
    `;

    const html = `
      <div class="rail"></div>
      <div class="dots">
        ${this.steps.map((_, i) => `
          <div class="dot ${i === this.index ? 'active' : ''}" data-index="${i}">
            ${this.showIcons ? `<i class="fas fa-${this.steps[i].icon} dot-icon"></i>` : ''}
          </div>
        `).join('')}
      </div>
      <div class="thumb">
        ${this.showIcons ? `<i class="fas fa-${this.steps[this.index]?.icon} thumb-icon"></i>` : ''}
      </div>
      <div class="label">${this.steps[this.index]?.value || ''}</div>
    `;
    
    this.shadowRoot.innerHTML = `<style>${style}</style>${html}`;

    // Update element references
    this.thumb = this.shadowRoot.querySelector(".thumb");
    this.label = this.shadowRoot.querySelector(".label");
    this.rail = this.shadowRoot.querySelector(".rail");
    this.dots = this.shadowRoot.querySelectorAll(".dot");

    // Reattach event listeners
    this.removeEventListeners();
    this.addEventListeners();

    // Update thumb position and icon
    this.updateThumb();
  }
}

// Register the custom element
customElements.define("slide-selector", SlideSelector);