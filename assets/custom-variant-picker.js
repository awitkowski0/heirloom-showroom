class CustomVariantPicker extends HTMLElement {
  constructor() {
    super();
    this.selectedOptions = {};
    this.variants = [];
    
    this.initialize();
  }

  initialize() {
    // Get variants from JSON data in the HTML
    const variantsEl = this.querySelector('[data-all-variants]');
    if (variantsEl) {
      try {
        this.variants = JSON.parse(variantsEl.textContent);
      } catch (e) {
        console.error('Failed to parse variants:', e);
        this.variants = [];
      }
    }

    // Get base price
    const basePriceEl = this.querySelector('[data-base-price]');
    this.basePrice = basePriceEl ? parseFloat(basePriceEl.textContent) || 0 : 0;
    
    // Initialize selected options from current state
    this.querySelectorAll('.custom-option').forEach((optionEl, index) => {
      const selectedInput = optionEl.querySelector('input:checked');
      if (selectedInput) {
        this.selectedOptions[index] = selectedInput.value;
      }
    });
  }

  connectedCallback() {
    this.addEventListener('change', this.handleChange.bind(this));
  }

  handleChange(event) {
    const target = event.target;
    if (!target.matches('input[type="radio"]')) return;

    const optionEl = target.closest('.custom-option');
    const optionIndex = optionEl.dataset.optionIndex;
    const selectedValue = target.value;
    
    // Update selected options
    this.selectedOptions[optionIndex] = selectedValue;
    
    // Update display
    const valueDisplay = optionEl.querySelector('[data-selected-value]');
    if (valueDisplay) {
      valueDisplay.textContent = selectedValue;
    }

    // Update visual selection
    optionEl.querySelectorAll('.custom-option__value').forEach((valueEl) => {
      valueEl.classList.remove('custom-option__value--selected');
      if (valueEl.dataset.value === selectedValue) {
        valueEl.classList.add('custom-option__value--selected');
      }
    });

    // Find matching variant
    this.updateVariant();
  }

  updateVariant() {
    // Build option values array matching the order in this.variants[0].options
    const optionValues = [];
    
    this.querySelectorAll('.custom-option').forEach((optionEl) => {
      const optionIndex = optionEl.dataset.optionIndex;
      optionValues.push(this.selectedOptions[optionIndex] || '');
    });

    // Find matching variant
    const matchingVariant = this.variants.find((variant) => {
      if (!variant.options || variant.options.length !== optionValues.length) return false;
      
      for (let i = 0; i < optionValues.length; i++) {
        if (variant.options[i] !== optionValues[i]) {
          return false;
        }
      }
      return true;
    });

    if (matchingVariant) {
      // Publish event for product-info to pick up
      if (typeof publish !== 'undefined') {
        publish('optionValueSelectionChange', {
          data: {
            selectedOptionValues: matchingVariant.id ? [matchingVariant.id] : [],
            target: null,
            variant: matchingVariant
          }
        });
      }

      // Update main product form variant ID
      this.updateProductFormVariant(matchingVariant);

      // Update URL
      if (matchingVariant.url) {
        const url = new URL(window.location.href);
        url.searchParams.set('variant', matchingVariant.id);
        window.history.replaceState({}, '', url);
      }
    }
  }

  updateProductFormVariant(variant) {
    const sectionId = this.dataset.sectionId;
    
    // Find all variant inputs in product forms
    document.querySelectorAll(`#product-form-${sectionId}`).forEach((form) => {
      const variantInput = form.querySelector('input[name="id"]');
      if (variantInput) {
        variantInput.value = variant.id;
      }
    });
    
    // Also try to find variant-selects to sync
    const variantSelects = document.querySelector('variant-selects');
    if (variantSelects) {
      const dataSelectedVariant = variantSelects.querySelector('[data-selected-variant]');
      if (dataSelectedVariant) {
        try {
          const variantData = JSON.parse(dataSelectedVariant.textContent);
          variantData.id = variant.id;
          variantData.price = variant.price;
          variantData.compare_at_price = variant.compare_at_price;
          dataSelectedVariant.textContent = JSON.stringify(variantData);
        } catch (e) {
          console.error('Failed to update variant data:', e);
        }
      }
    }
  }
}

customElements.define('custom-variant-picker', CustomVariantPicker);