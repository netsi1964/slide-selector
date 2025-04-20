// Define interfaces for our component's data structures
interface Step {
    value: string;
    icon: string;
  }
  
  interface LabelPositionStyles {
    position: string;
    background: string;
    color: string;
    padding: string;
    borderRadius: string;
    fontSize: string;
    fontWeight: string;
    whiteSpace: string;
    opacity: string;
    transition: string;
    pointerEvents: string;
    zIndex: string;
    boxShadow: string;
    border: string;
    [key: string]: string; // Allow for dynamic style properties
  }
  
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
  
    static get observedAttributes(): string[] {
      return ['steps', 'label-placement', 'show-icons', 'value'];
    }
  
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
  
    // Public methods
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
  
    public getIndex(): number {
      return this.index;
    }
  
    public getValue(): string {
      return this.steps[this.index]?.value || '';
    }
  
    public getIcon(): string {
      return this.steps[this.index]?.icon || '';
    }
  
    public setSteps(newSteps: Step[]): void {
      this.steps = newSteps;
      this.index = Math.floor(this.steps.length / 2);
      this.render();
    }
  
    public setLabelPlacement(placement: string): void {
      this.labelPlacement = placement;
      this.setAttribute('label-placement', placement);
      this.render();
    }
  
    public setShowIcons(show: boolean): void {
      this.showIcons = show;
      this.setAttribute('show-icons', show.toString());
      this.render();
    }
  
    private render(): void {
      if (!this.shadowRoot) return;
  
      const style = `/* Your existing styles */`;
      const html = `/* Your existing HTML template */`;
      
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