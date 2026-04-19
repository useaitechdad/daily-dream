/**
 * Lightweight toast notification system.
 * Appends a fixed-position container to the DOM on first use.
 *
 * @module toast
 */

let container = null;

function ensureContainer() {
  if (container) return;
  container = document.createElement('div');
  container.id = 'toast-container';
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success' | 'error' | 'info'} [type='info']
 * @param {number} [durationMs=3000]
 */
export function showToast(message, type = 'info', durationMs = 3000) {
  ensureContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'status');

  toast.addEventListener('click', () => dismiss(toast));

  container.appendChild(toast);

  // Trigger entry animation on next frame
  requestAnimationFrame(() => {
    toast.classList.add('toast--visible');
  });

  setTimeout(() => dismiss(toast), durationMs);
}

function dismiss(toast) {
  toast.classList.remove('toast--visible');
  toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  // Fallback removal if transitionend doesn't fire
  setTimeout(() => toast.remove(), 400);
}
