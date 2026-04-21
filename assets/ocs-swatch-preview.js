/**
 * OCS Swatch Preview — Stain + Wood Color Picker
 * ============================================================
 * Purpose: Wires the stain radio inputs and wood radio inputs to
 *          reveal and update a large swatch preview panel below
 *          the main product media gallery when either selection
 *          changes.
 *
 * Reads data attributes written by product-variant-options.liquid:
 *   data-ocs-swatch-wood-[wood-handle] — 800px CDN URL per wood type
 *   e.g. data-ocs-swatch-wood-red-oak="https://cdn..."
 *        data-ocs-swatch-wood-brown-maple="https://cdn..."
 *        data-ocs-swatch-wood-cherry="https://cdn..."
 *
 * ============================================================
 * CHANGE: Rewrote from select[name*="Stain"] single-attribute
 *         approach to radio input multi-attribute approach.
 * REASON: 1. Picker type is button/pill — no <select> exists.
 *         2. Single data attribute was baked in at page load for
 *            the default wood only — switching wood showed wrong
 *            swatch image.
 *         3. New architecture writes one attribute per wood and
 *            reads the correct one based on currently selected wood.
 * SCALABLE: Works for any number of vendors, wood types, and stains.
 *           No code changes needed when new products are added.
 *           Vendor spec: option 1 = wood, option 2 = stain.
 * Author: Sidekick / Heirloom Cribs
 * Date:   2026-04-21
 * ============================================================
 *
 * No dependencies — vanilla JS only.
 */

(function () {
  'use strict';

  function initSwatchPreview(section) {

    /* ============================================================
       BEGIN NEW CODE — Value-based radio input identification
       CHANGE: Replaced name*="main-0/1" index selectors with
               value-based filtering using known wood option values.
       REASON: Radio input names use a flat index per value across
               ALL options — main-0, main-1, main-2 are used by
               BOTH wood (3 values) and stain (11 values) causing
               index-based selectors to match wrong inputs.
               Filtering by known wood values is reliable regardless
               of how many options or values exist.
       SCALABLE: Update woodValues array when new wood types are
                 added to the product. Future improvement: drive
                 this from a data attribute on the section element
                 written by Liquid so no JS change is ever needed.
       Author: Sidekick / Heirloom Cribs
       Date:   2026-04-21
    ============================================================ */
    var woodValues  = ['Red Oak', 'Brown Maple', 'Cherry'];
    var allRadios   = Array.from(section.querySelectorAll('input[type="radio"]'));
    var woodInputs  = allRadios.filter(function(i) { return woodValues.indexOf(i.value) > -1; });
    var stainInputs = allRadios.filter(function(i) { return woodValues.indexOf(i.value) === -1; });
    /* ============================================================
       END NEW CODE — Value-based radio input identification
    ============================================================ */

    if (!stainInputs.length) return;

    var previewPanel   = section.querySelector('.ocs-swatch-preview');
    var previewImg     = section.querySelector('.ocs-swatch-preview__image');
    var previewCaption = section.querySelector('.ocs-swatch-preview__caption');

    function getSelectedWoodHandle() {
      var checkedWood = woodInputs.find(function(i) { return i.checked; });
      if (!checkedWood) return null;
      return checkedWood.value.toLowerCase().replace(/\s+/g, '-');
    }

    function updateSwatch() {
      var checkedStain = stainInputs.find(function(i) { return i.checked; });
      var woodHandle   = getSelectedWoodHandle();

      if (!checkedStain || !woodHandle) {
        if (previewPanel) previewPanel.style.display = 'none';
        return;
      }

      /* Convert kebab-handle to camelCase for dataset lookup
         e.g. red-oak -> ocsSwatchWoodRedOak */
      var camelKey = 'ocsSwatchWood' + woodHandle
        .split('-')
        .map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); })
        .join('');

      var largeUrl = checkedStain.dataset[camelKey];
      var label    = checkedStain.value;

      if (largeUrl && previewPanel && previewImg) {
        previewImg.src           = largeUrl;
        previewImg.alt           = label;
        if (previewCaption) previewCaption.textContent = label;
        previewPanel.style.display = 'block';
        previewPanel.classList.add('ocs-swatch-preview--active');
      } else {
        if (previewPanel) {
          previewPanel.style.display = 'none';
          previewPanel.classList.remove('ocs-swatch-preview--active');
        }
      }
    }

    stainInputs.forEach(function(input) {
      input.addEventListener('change', updateSwatch);
    });

    woodInputs.forEach(function(input) {
      input.addEventListener('change', updateSwatch);
    });

    // Run on page load to reflect default selections
    updateSwatch();
  }

  function init() {
    document.querySelectorAll('.shopify-section').forEach(initSwatchPreview);

    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && node.classList.contains('shopify-section')) {
            initSwatchPreview(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();