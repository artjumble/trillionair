// Real-world equivalents for the comparison ticker. Each figure is cited transparently
// in the copy so it's an honest translation of the pile, not a hidden claim. Sources
// (rounded, ~2023–24): school lunch ~$4; extreme-poverty line $2.15/day ≈ $785/yr (World
// Bank 2022); median US gross rent ~$1,500/mo; in-state public 4-yr tuition+fees ~$11K/yr
// (College Board); federal minimum wage $7.25/hr × 2080h ≈ $15,080/yr; average new car
// ~$48K (KBB); teacher ~$69K (NEA); median US household ~$80K (Census); nurse ~$86K (BLS
// RN median); median US home ~$420K (NAR); a median worker's lifetime earnings ~$1.7M;
// NASA's annual budget ~$25B (FY2024); ending world hunger ~$40B/yr (figure the UN has
// cited; estimates vary).
//
// `render` receives the already-formatted count string. Ordered cheapest -> dearest.

export const COMPARISONS = [
  { perUnit: 4, render: (n) => `≈ ${n} school lunches (~$4 each)` },
  { perUnit: 785, render: (n) => `≈ a year above the extreme-poverty line ($2.15/day) for ${n} people` },
  { perUnit: 1500, render: (n) => `≈ ${n} months of median U.S. rent (~$1,500/mo)` },
  { perUnit: 11000, render: (n) => `≈ ${n} years of in-state public university (~$11K/yr)` },
  { perUnit: 15080, render: (n) => `≈ ${n} years of U.S. federal minimum wage ($7.25/hr)` },
  { perUnit: 48000, render: (n) => `≈ ${n} new cars (~$48K each)` },
  { perUnit: 69000, render: (n) => `≈ paying ${n} teachers for a year (~$69K each)` },
  { perUnit: 80000, render: (n) => `≈ ${n} years of a typical U.S. household's income (~$80K/yr)` },
  { perUnit: 86000, render: (n) => `≈ paying ${n} nurses for a year (~$86K each)` },
  { perUnit: 420000, render: (n) => `≈ ${n} median U.S. homes (~$420K each)` },
  { perUnit: 1700000, render: (n) => `≈ ${n} Americans' entire working lives of earnings (~$1.7M each)` },
  { perUnit: 25000000000, render: (n) => `≈ ${n} years of NASA's entire budget (~$25B/yr)` },
  { perUnit: 40000000000, render: (n) => `≈ the ~$40B/yr the UN has cited to end world hunger — ${n}× over` },
];
