// Idle income generators: data + pure cost math. Owned counts live in state.js.
//
// Each generator: cost(n) = baseCost * costMult^owned ; income = baseIncome * owned (× future multipliers).
// Themed to the satire — an arc from honest labor, to employing others, to pure ownership.

const Decimal = window.Decimal;

export const generators = [
  {
    id: 'lemonade',
    name: 'Lemonade Stand',
    flavor: 'You squeeze the lemons yourself. Honest work — and nowhere near enough.',
    baseCost: 15,
    costMult: 1.15,
    baseIncome: 0.1,
  },
  {
    id: 'foodtruck',
    name: 'Food Truck',
    flavor: 'Now someone else flips the burgers while you "manage." The margin is the point.',
    baseCost: 200,
    costMult: 1.15,
    baseIncome: 2,
  },
  {
    id: 'sweatshop',
    name: 'Sweatshop',
    flavor: 'Their hands, your income. That number is really their wages — minus what you keep.',
    baseCost: 3000,
    costMult: 1.15,
    baseIncome: 40,
  },
  {
    id: 'rentco',
    name: 'Rent-Seeking LLC',
    flavor: 'You produce nothing and collect everything. Now we are finally getting somewhere.',
    baseCost: 45000,
    costMult: 1.15,
    baseIncome: 800,
  },
  {
    id: 'hedgefund',
    name: 'Hedge Fund',
    flavor: "Money managing money. You haven't met a customer in years — the customer is a teachers' pension.",
    baseCost: 650000,
    costMult: 1.15,
    baseIncome: 16000,
  },
  {
    id: 'privateequity',
    name: 'Private Equity Firm',
    flavor: 'Buy a company with its own money, sell the building, fire the staff, call it "efficiency."',
    baseCost: 9000000,
    costMult: 1.15,
    baseIncome: 240000,
  },
  {
    id: 'taxhaven',
    name: 'Offshore Tax Haven',
    flavor: 'Your fortune summers in the Caymans. It pays a lower rate than the people who clean your office.',
    baseCost: 130000000,
    costMult: 1.15,
    baseIncome: 4000000,
  },
  {
    id: 'mediaempire',
    name: 'Media Empire',
    flavor: 'Own the story and the story is always the same: you earned every cent, fair and square.',
    baseCost: 2000000000,
    costMult: 1.15,
    baseIncome: 70000000,
  },
  {
    id: 'lobbying',
    name: 'Lobbying Operation',
    flavor: 'Why follow the rules when you can expense the people who write them? It’s a "think tank."',
    baseCost: 30000000000,
    costMult: 1.15,
    baseIncome: 1200000000,
  },
  {
    id: 'toobig',
    name: 'Too-Big-to-Fail Bank',
    flavor: 'Heads you win. Tails, the public covers it. Somehow there is never a tails.',
    baseCost: 500000000000,
    costMult: 1.15,
    baseIncome: 25000000000,
  },
];

export function genById(id) {
  return generators.find((g) => g.id === id);
}

/** Cost of the NEXT single unit given the current owned count. */
export function unitCost(gen, owned) {
  return new Decimal(gen.baseCost).mul(Decimal.pow(gen.costMult, owned));
}

/**
 * Total cost to buy `count` consecutive units starting from `owned`.
 * Geometric series: first * (r^count - 1) / (r - 1), where first = unitCost(owned).
 */
export function bulkCost(gen, owned, count) {
  if (count <= 0) return new Decimal(0);
  const r = new Decimal(gen.costMult);
  const first = unitCost(gen, owned);
  const num = Decimal.pow(r, count).sub(1);
  const den = r.sub(1);
  return first.mul(num).div(den);
}

/**
 * Largest number of units affordable with `money` starting from `owned`.
 * Inverts the geometric sum, then guards against rounding so we never overspend.
 */
export function maxAffordable(gen, owned, money) {
  const r = new Decimal(gen.costMult);
  const first = unitCost(gen, owned);
  if (money.lt(first)) return 0;
  // money >= first*(r^k - 1)/(r - 1)  =>  r^k <= 1 + money*(r-1)/first  =>  k <= log_r(...)
  const ratio = money.mul(r.sub(1)).div(first).add(1);
  let k = Math.floor(ratio.log10() / r.log10());
  // Floating-point guard: step down until the true bulk cost fits.
  while (k > 0 && bulkCost(gen, owned, k).gt(money)) k--;
  return Math.max(0, k);
}
