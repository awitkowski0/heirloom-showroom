class CustomVariantPicker extends HTMLElement {
  constructor() {
    super();
    this.basePrice = 0;
    this.selectedOptions = {};
    this.productVariants = [];
    
    this.initialize();
  }

  initialize() {
    // Get base price from JSON
    const basePriceEl = this.querySelector('[data-base-price]');
    if (basePriceEl) {
      this.basePrice = parseFloat(basePriceEl.textContent) || 0;
    }

    // Get product variants from the product object in global context
    this.productVariants = window.productVariants || [];
    
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
    // Build option names to values mapping
    const optionNames = [];
    const optionValues = [];
    
    this.querySelectorAll('.custom-option').forEach((optionEl) => {
      const optionName = optionEl.dataset.optionName;
      const optionIndex = optionEl.dataset.optionIndex;
      optionNames.push(optionName);
      optionValues.push(this.selectedOptions[optionIndex] || '');
    });

    // Find matching variant
    const matchingVariant = this.productVariants.find((variant) => {
      if (!variant.options) return false;
      
      for (let i = 0; i < optionNames.length; i++) {
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

      // Update price display
      this.updatePrice(matchingVariant);

      // Update main product form variant ID
      this.updateProductFormVariant(matchingVariant);

      // Update URL if needed
      if (matchingVariant.url) {
        // Could update URL here if desired
      }
    }
  }

  updatePrice(variant) {
    const priceEl = document.querySelector(`#price-${this.dataset.sectionId}`);
    if (priceEl && variant.price) {
      const priceHtml = this.formatPrice(variant.price, variant.compare_at_price);
      priceEl.innerHTML = priceHtml;
    }
  }

  formatPrice(price, compareAtPrice) {
    const formattedPrice = this.formatMoney(price);
    let html = `<span class="price-item price-item--regular">${formattedPrice}</span>`;
    
    if (compareAtPrice && compareAtPrice > price) {
      const formattedCompareAt = this.formatMoney(compareAtPrice);
      html += `<span class="price-item price-item--regular" style="text-decoration: line-through; opacity: 0.6;">${formattedCompareAt}</span>`;
    }
    
    return html;
  }

  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  updateProductFormVariant(variant) {
    const sectionId = this.dataset.sectionId;
    const productForm = document.querySelector(`#product-form-${sectionId}`);
    if (productForm) {
      const variantInput = productForm.querySelector('input[name="id"]');
      if (variantInput) {
        variantInput.value = variant.id;
      }
    }
  }
}

customElements.define('custom-variant-picker', CustomVariantPicker);

// Initialize variants from product data on page load
document.addEventListener('DOMContentLoaded', () => {
  const picker = document.querySelector('custom-variant-picker');
  if (picker && typeof product !== 'undefined') {
    window.productVariants = product.variants.map(v => ({
      id: v.id,
      title: v.title,
      price: v.price,
      compare_at_price: v.compare_at_price,
      options: v.options,
      featured_image: v.featured_image,
      available: v.available
    }));
  }
});