/**
 * Paymob Unified Checkout public key (safe to expose in the browser).
 * Must match the same Paymob account and mode (test vs live) as backend PAYMOB_TOKEN.
 */
export function getPaymobPublicKey() {
  const fromEnv = import.meta.env.VITE_PAYMOB_PUBLIC_KEY;
  if (fromEnv) return String(fromEnv).trim();
  if (import.meta.env.DEV) {
    return 'egy_pk_test_xgfkuiZo2us0viNDmSCVU1OvNnJQOUwv';
  }
  return '';
}
