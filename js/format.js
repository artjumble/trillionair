// Number formatting for big money values.
// Uses the global `Decimal` from the vendored break_infinity.js.

const Decimal = window.Decimal;

// Short-scale suffixes. Extend as needed; falls back to scientific notation beyond.
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

// When true, large numbers render in scientific notation (1.23e6) instead of suffixes.
let sciNotation = false;
export function setSciNotation(on) {
  sciNotation = !!on;
}

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
    if (d.lt(10)) {
      // Floor to 2 decimals so we never display more than is actually there.
      return floor2(d).toFixed(2).replace(/\.00$/, '');
    }
    return d.floor().toFixed(0);
  }
  if (sciNotation) return d.toExponential(2);
  const exp = Math.floor(d.log10());
  const tier = Math.floor(exp / 3);
  if (tier < SUFFIXES.length) {
    const scaled = d.div(Decimal.pow(10, tier * 3));
    // Floor to 2 decimals: displayed value is always ≤ the real value, so a shown
    // amount that meets a shown cost is genuinely affordable (no off-by-one).
    return floor2(scaled).toFixed(2) + SUFFIXES[tier];
  }
  return d.toExponential(2);
}

/** Floor a Decimal to 2 decimal places. */
function floor2(d) {
  return d.mul(100).floor().div(100);
}

/** Format a money value (prefixes a $). */
export function money(value) {
  return '$' + format(value);
}
