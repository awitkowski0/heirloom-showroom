/**
 * OCS Swatch Preview — Stain Color Picker
 * ============================================================
 * Purpose: Wires the "Stain and color options" dropdown to:
 *   1. Show a thumbnail swatch image beside the dropdown label
 *   2. Reveal and update a large swatch preview panel below the
 *      main product media gallery when a stain is selected
 *
 * Reads data attributes set by product-variant-options.liquid:
 *   data-ocs-swatch-thumb  — 50px CDN URL for inline thumbnail
 *   data-ocs-swatch-large  — 800px CDN URL for large preview panel
 *
 * Targets by section ID to support multiple sections per page.
 * No dependencies — vanilla JS only.
 *
 * Author: Sidekick / Heirloom Cribs
 * Date:   2026-04-20
 * ============================================================
 */

(function () {
  'use strict';

  /**
   * Initialize swatch preview for a single product section.
   * @param {HTMLElement} section - The product section root element
   */
  function initSwatchPreview(section) {
    const sectionId = section.dataset.sectionId || section.id.replace('shopify-section-', '');

    // Find the stain dropdown — identified by its name containing 'Stain'
    // BEGIN NEW CODE — dropdown selector targets option name containing 'Stain'
    const stainSelect = section.querySelector('select[name*="Stain"]');
    if (!stainSelect) return; // Not a product with stain options — exit silently

    // Large preview panel elements
    const previewPanel = section.querySelector(`#ocs-swatch-preview-${sectionId}`);
    const previewImg   = section.querySelector(`#ocs-swatch-preview-img-${sectionId}`);
    const previewCaption = section.querySelector(`#ocs-swatch-preview-caption-${sectionId}`);

    // Inline thumbnail element — injected beside the dropdown label
    // We create it once and reuse it on every change event
    let thumbEl = section.querySelector('.ocs-swatch-thumb');
    if (!thumbEl) {
      thumbEl = document.createElement('img');
      thumbEl.className = 'ocs-swatch-thumb';
      thumbEl.alt = '';
      thumbEl.width = 50;
      thumbEl.height = 50;
      thumbEl.style.display = 'none';
      // Insert immediately after the select element
      stainSelect.insertAdjacentElement('afterend', thumbEl);
    }
    // END NEW CODE — dropdown selector and thumbnail injection

    /**
     * Update preview panel and inline thumbnail from selected option.
     */
    function updateSwatch() {
      // BEGIN NEW CODE — swatch update handler
      const selected = stainSelect.options[stainSelect.selectedIndex];
      const thumbUrl = selected ? selected.dataset.ocsSwatchThumb : null;
      const largeUrl = selected ? selected.dataset.ocsSwatchLarge : null;
      const label    = selected ? selected.textContent.trim() : '';

      // Update inline thumbnail beside dropdown
      if (thumbUrl) {
        thumbEl.src = thumbUrl;
        thumbEl.alt = label;
        thumbEl.style.display = 'inline-block';
      } else {
        thumbEl.style.display = 'none';
      }

      // Update large preview panel
      if (largeUrl && previewPanel && previewImg) {
        previewImg.src = largeUrl;
        previewImg.alt = label;
        if (previewCaption) previewCaption.textContent = label;
        previewPanel.style.display = 'block';
        previewPanel.classList.add('ocs-swatch-preview--active');
      } else if (previewPanel) {
        previewPanel.style.display = 'none';
        previewPanel.classList.remove('ocs-swatch-preview--active');
      }
      // END NEW CODE — swatch update handler
    }

    // Run on dropdown change
    stainSelect.addEventListener('change', updateSwatch);

    // Run on page load to reflect default selected option
    updateSwatch();
  }

  /**
   * Run init on all product sections present on the page.
   * Uses MutationObserver to handle dynamically loaded sections (e.g. quick add).
   */
  function init() {
    // BEGIN NEW CODE — section discovery and observer
    document.querySelectorAll('.shopify-section').forEach(initSwatchPreview);

    // Watch for dynamically added sections (quick add, etc.)
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1 && node.classList.contains('shopify-section')) {
            initSwatchPreview(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    // END NEW CODE — section discovery and observer
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
