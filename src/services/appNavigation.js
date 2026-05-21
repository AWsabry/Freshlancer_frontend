/**
 * Bridges React Router to modules that cannot use hooks (e.g. axios).
 * Avoids full page loads to /login so static hosts without SPA fallback for
 * deep links still work after logout or 401.
 */

let navigateFn = null;
let resetAuthFn = null;

export function registerAppNavigation(onNavigate, onResetAuth) {
  navigateFn = typeof onNavigate === 'function' ? onNavigate : null;
  resetAuthFn = typeof onResetAuth === 'function' ? onResetAuth : null;
}

export function clearAppNavigation() {
  navigateFn = null;
  resetAuthFn = null;
}

export function redirectToLogin() {
  resetAuthFn?.();
  if (navigateFn) {
    navigateFn('/login', { replace: true });
    return;
  }
  window.location.assign('/login');
}
