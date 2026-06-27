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
    baseCost: 220,
    costMult: 1.15,
    baseIncome: 1.6,
  },
  {
    id: 'sweatshop',
    name: 'Sweatshop',
    flavor: 'Their hands, your income. That number is really their wages — minus what you keep.',
    baseCost: 3400,
    costMult: 1.15,
    baseIncome: 22,
  },
  {
    id: 'rentco',
    name: 'Rent-Seeking LLC',
    flavor: 'You produce nothing and collect everything. Now we are finally getting somewhere.',
    baseCost: 52000,
    costMult: 1.15,
    baseIncome: 340,
  },
];

export function genById(id) {
  return generators.find((g) => g.id === id);
}

/** Cost of the NEXT single unit given the current owned count. */
export function unitCost(gen, owned) {
  return new Decimal(gen.baseCost).mul(Decimal.pow(gen.costMult, owned));
}
