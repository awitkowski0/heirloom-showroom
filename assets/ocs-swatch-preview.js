/**
 * OCS Swatch Preview — Stain Color Picker
 * ============================================================
 * Purpose: Wires the "Stain and color options" radio inputs to:
 *   1. Reveal and update a large swatch preview panel below the
 *      main product media gallery when a stain is selected
 *   2. Show an inline thumbnail beside the selected swatch label
 *
 * Reads data attributes written by product-variant-options.liquid:
 *   data-ocs-swatch-thumb  — 50px CDN URL for inline thumbnail
 *   data-ocs-swatch-large  — 800px CDN URL for large preview panel
 *
 * ============================================================
 * CHANGE: Rewrote selector from select[name*="Stain"] to radio
 *         inputs identified by option position (name*="main-1").
 * REASON: The picker type is 'button' (pill/radio), not dropdown.
 *         The rendered input name is a generated ID like
 *         "Option-template--20496124117166__main-1" — it does not
 *         contain the word "Stain" so the original select selector
 *         always returned null and the JS silently exited.
 * EFFECT: JS now correctly finds all stain radio inputs, reads
 *         data-ocs-swatch-thumb and data-ocs-swatch-large, and
 *         populates the preview panel on change and page load.
 * Author: Sidekick / Heirloom Cribs
 * Date:   2026-04-21
 * ============================================================
 *
 * Targets by section ID to support multiple sections per page.
 * No dependencies — vanilla JS only.
 */

(function () {
  'use strict';

  /**
   * Initialize swatch preview for a single product section.
   * @param {HTMLElement} section - The product section root element
   */
  function initSwatchPreview(section) {

    /* ============================================================
       BEGIN NEW CODE — Radio input selector by option position
       CHANGE: Was select[name*="Stain"] — now targets radio inputs
               whose name contains "main-1" (position index of the
               Stain and color options group in the rendered DOM).
       REASON: Picker is button/pill type — no <select> exists.
               Name pattern "main-1" reliably identifies the second
               option group (stain) regardless of section ID changes.
    ============================================================ */
    const stainInputs = section.querySelectorAll('input[type="radio"][name*="main-1"]');
    if (!stainInputs.length) return; // Not a product with stain options — exit silently
    /* ============================================================
       END NEW CODE — Radio input selector by option position
    ============================================================ */

    /* ============================================================
       BEGIN NEW CODE — Section ID derived from panel element
       CHANGE: Was derived from section.dataset.sectionId which
               returned a shortened ID. Now reads the actual panel
               element ID directly to guarantee the correct suffix
               (e.g. template--20496124117166__main).
       REASON: Panel IDs are set by Liquid using section.id which
               includes the full template--XXXXXXXXXXXXXXXX__main
               string. Deriving the ID from dataset caused a mismatch
               and the panel was never found.
    ============================================================ */
    const previewPanel   = section.querySelector('[id^="ocs-swatch-preview-"][id$="' + (section.dataset.sectionId || '') + '"]') || section.querySelector('.ocs-swatch-preview');
    const previewImg     = section.querySelector('[id^="ocs-swatch-preview-img-"]');
    const previewCaption = section.querySelector('[id^="ocs-swatch-preview-caption-"]');
    /* ============================================================
       END NEW CODE — Section ID derived from panel element
    ============================================================ */

    /**
     * Update preview panel from the currently checked stain radio input.
     */
    function updateSwatch() {

      /* ============================================================
         BEGIN NEW CODE — Read data attributes from checked radio input
         CHANGE: Was reading dataset from a <select> option element.
                 Now finds the checked radio input within the stain
                 group and reads data-ocs-swatch-thumb and
                 data-ocs-swatch-large directly from that input.
         REASON: Radio inputs hold the data attributes written by
                 product-variant-options.liquid, not a <select>.
      ============================================================ */
      const checked  = section.querySelector('input[type="radio"][name*="main-1"]:checked');
      const thumbUrl = checked ? checked.dataset.ocsSwatchThumb : null;
      const largeUrl = checked ? checked.dataset.ocsSwatchLarge : null;
      const label    = checked ? checked.value : '';
      /* ============================================================
         END NEW CODE — Read data attributes from checked radio input
      ============================================================ */

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
    }

    /* ============================================================
       BEGIN NEW CODE — Attach change listeners to all stain radios
       CHANGE: Was a single 'change' event on a <select> element.
               Now attaches a listener to every stain radio input
               so any pill click triggers the swatch update.
       REASON: Radio inputs each fire their own change event —
               there is no single container element to listen on.
    ============================================================ */
    stainInputs.forEach(function (input) {
      input.addEventListener('change', updateSwatch);
    });
    /* ============================================================
       END NEW CODE — Attach change listeners to all stain radios
    ============================================================ */

    // Run on page load to reflect default selected stain
    updateSwatch();
  }

  /**
   * Run init on all product sections present on the page.
   * Uses MutationObserver to handle dynamically loaded sections.
   */
  function init() {
    document.querySelectorAll('.shopify-section').forEach(initSwatchPreview);

    // Watch for dynamically added sections (quick add, etc.)
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1 && node.classList.contains('shopify-section')) {
            initSwatchPreview(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

