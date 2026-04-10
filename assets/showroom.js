class ShowroomEditor {
  constructor(sectionId) {
    this.sectionId = sectionId;
    this.container = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!this.container) return;

    this.imageWrapper = this.container.querySelector('.showroom__image-wrapper');
    if (!this.imageWrapper) return;

    this.init();
  }

  init() {
    this.container.addEventListener('click', (e) => this.handleClick(e));
    this.updateHotspotPositions();
  }

  handleClick(e) {
    if (!window.Shopify || !window.Shopify.designerMode) return;

    const rect = this.imageWrapper.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      this.updateActiveHotspot(x, y);
    }
  }

  updateActiveHotspot(x, y) {
    const activeBlock = document.querySelector(`.showroom__hotspot[aria-current="step"]`);
    if (!activeBlock) return;

    const xInput = activeBlock.querySelector('[id$="_position_x"]');
    const yInput = activeBlock.querySelector('[id$="_position_y"]');

    if (xInput && yInput) {
      xInput.value = Math.round(x);
      yInput.value = Math.round(y);
      xInput.dispatchEvent(new Event('change', { bubbles: true }));
      yInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const dot = activeBlock.querySelector('.showroom__hotspot-dot');
    if (dot) {
      dot.style.setProperty('--pos-x', `${x}%`);
      dot.style.setProperty('--pos-y', `${y}%`);
    }
  }

  updateHotspotPositions() {
    const hotspots = this.container.querySelectorAll('.showroom__hotspot');
    hotspots.forEach((hotspot) => {
      const xInput = hotspot.querySelector('[id$="_position_x"]');
      const yInput = hotspot.querySelector('[id$="_position_y"]');

      if (xInput && yInput) {
        const x = xInput.value || 50;
        const y = yInput.value || 50;
        hotspot.style.setProperty('--pos-x', `${x}%`);
        hotspot.style.setProperty('--pos-y', `${y}%`);
      }
    });
  }
}

document.addEventListener('shopify:section:load', (event) => {
  new ShowroomEditor(event.detail.sectionId);
});

document.addEventListener('shopify:block:select', (event) => {
  const hotspot = event.target.closest('.showroom__hotspot');
  if (hotspot) {
    hotspot.setAttribute('aria-current', 'step');
  }
});

document.addEventListener('shopify:block:deselect', (event) => {
  const hotspot = event.target.closest('.showroom__hotspot');
  if (hotspot) {
    hotspot.removeAttribute('aria-current');
  }
});

document.addEventListener('shopify:block:move', (event) => {
  const section = event.target.closest('[data-section-id]');
  if (section) {
    new ShowroomEditor(section.dataset.sectionId);
  }
});
