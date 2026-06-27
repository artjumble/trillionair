// Number formatting for big money values.
// Uses the global `Decimal` from the vendored break_infinity.js.

const Decimal = window.Decimal;

// Short-scale suffixes. Extend as needed; falls back to scientific notation beyond.
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

/** Coerce a value to a Decimal. */
export function dec(value) {
  return value instanceof Decimal ? value : new Decimal(value);
}

/**
 * Format a number with 3 significant figures and a short-scale suffix.
 * e.g. 12345 -> "12.3K", 1e12 -> "1.00T". Beyond the suffix table -> "1.23e45".
 */
export function format(value) {
  const d = dec(value);
  if (d.lt(1000)) {
    // Whole numbers under 1000 read cleaner without decimals.
    return d.lt(10) ? d.toFixed(2).replace(/\.00$/, '') : d.toFixed(0);
  }
  const exp = Math.floor(d.log10());
  const tier = Math.floor(exp / 3);
  if (tier < SUFFIXES.length) {
    const scaled = d.div(Decimal.pow(10, tier * 3));
    return scaled.toFixed(2) + SUFFIXES[tier];
  }
  return d.toExponential(2);
}

/** Format a money value (prefixes a $). */
export function money(value) {
  return '$' + format(value);
}
