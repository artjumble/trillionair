// Real-world equivalents for the comparison ticker. Each figure is cited transparently
// in the copy so it's an honest translation of the pile, not a hidden claim. Sources:
//   teacher ~$69K/yr (NEA 2023-24), nurse ~$86K/yr (BLS RN median 2023),
//   median US household ~$80K/yr (Census 2023), federal minimum wage $7.25/hr × 2080h,
//   school lunch ~$4, extreme-poverty line $2.15/day × 365 ≈ $785/yr (World Bank 2022),
//   end-world-hunger ~$40B/yr (figure the UN has cited; estimates vary).
//
// `render` receives the already-formatted count string. Ordered cheapest -> dearest.

export const COMPARISONS = [
  { perUnit: 4, render: (n) => `≈ ${n} school lunches (~$4 each)` },
  { perUnit: 785, render: (n) => `≈ a year above the extreme-poverty line ($2.15/day) for ${n} people` },
  { perUnit: 15080, render: (n) => `≈ ${n} years of U.S. federal minimum wage ($7.25/hr)` },
  { perUnit: 69000, render: (n) => `≈ paying ${n} teachers for a year (~$69K each)` },
  { perUnit: 80000, render: (n) => `≈ ${n} years of a typical U.S. household's income (~$80K/yr)` },
  { perUnit: 86000, render: (n) => `≈ paying ${n} nurses for a year (~$86K each)` },
  { perUnit: 40000000000, render: (n) => `≈ the ~$40B/yr the UN has cited to end world hunger — ${n}× over` },
];
