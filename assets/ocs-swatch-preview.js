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
       BEGIN NEW CODE — Radio input selectors by option position
       Wood = name*="main-0" (option 1)
       Stain = name*="main-1" (option 2)
       REASON: Rendered input names are generated IDs containing
               the option index, not the option label text.
               name*="main-0" reliably targets wood pills.
               name*="main-1" reliably targets stain pills.
    ============================================================ */
    var stainInputs = section.querySelectorAll('input[type="radio"][name*="main-1"]');
    var woodInputs  = section.querySelectorAll('input[type="radio"][name*="main-0"]');

    if (!stainInputs.length) return;
    /* ============================================================
       END NEW CODE — Radio input selectors by option position
    ============================================================ */

    var previewPanel   = section.querySelector('.ocs-swatch-preview');
    var previewImg     = section.querySelector('.ocs-swatch-preview__image');
    var previewCaption = section.querySelector('.ocs-swatch-preview__caption');

    /* ============================================================
       BEGIN NEW CODE — Dynamic wood-keyed swatch lookup
       CHANGE: Was reading data-ocs-swatch-large from checked stain.
               Now reads data-ocs-swatch-wood-[wood-handle] where
               wood-handle is derived from the currently checked
               wood radio input value.
       REASON: Swatch image must reflect BOTH selected wood AND
               selected stain. Single attribute approach only
               reflected the wood selected at page load.
    ============================================================ */
    function getSelectedWoodHandle() {
      var checkedWood = section.querySelector('input[type="radio"][name*="main-0"]:checked');
      if (!checkedWood) return null;
      return checkedWood.value.toLowerCase().replace(/\s+/g, '-');
    }

    function updateSwatch() {
      var checkedStain = section.querySelector('input[type="radio"][name*="main-1"]:checked');
      var woodHandle   = getSelectedWoodHandle();

      if (!checkedStain || !woodHandle) {
        if (previewPanel) previewPanel.style.display = 'none';
        return;
      }

      var dataKey  = 'ocsSwatchWood' + woodHandle.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
      var largeUrl = checkedStain.dataset[dataKey];
      var label    = checkedStain.value;

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
    }
    /* ============================================================
       END NEW CODE — Dynamic wood-keyed swatch lookup
    ============================================================ */

    /* ============================================================
       BEGIN NEW CODE — Listen on both wood and stain radio groups
       CHANGE: Was listening only on stain select change event.
               Now listens on all stain AND wood radio inputs.
       REASON: Switching wood type must also update the swatch
               preview to show the correct wood+stain combination.
    ============================================================ */
    stainInputs.forEach(function(input) {
      input.addEventListener('change', updateSwatch);
    });

    woodInputs.forEach(function(input) {
      input.addEventListener('change', updateSwatch);
    });
    /* ============================================================
       END NEW CODE — Listen on both wood and stain radio groups
    ============================================================ */

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
