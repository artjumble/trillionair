// One-time multiplicative upgrades — the real number-explosion lever.
// Three kinds: 'click' (boosts the manual click), 'gen' (boosts one generator),
// 'global' (boosts all income). The satire lives in the names: you don't work
// harder, you capture the rules.
//
// Pure data + pure helpers. Owned/purchased state lives in state.js.

const Decimal = window.Decimal;

export const upgrades = [
  // --- Click: clicking stays trivial next to capital — that's the joke. ---
  { id: 'click_handshake', type: 'click', mult: 2, cost: 100,
    name: 'Firmer Handshake', flavor: 'Clicks earn ×2. It will still never matter.',
    req: { money: 50 } },
  { id: 'click_hustle', type: 'click', mult: 3, cost: 5000,
    name: 'Hustle Mindset™', flavor: 'Rise and grind. Clicks ×3. Passive income yawns.',
    req: { money: 2000 } },

  // --- Per-generator: unlock by owning 10 of the target. ---
  { id: 'up_lemo1', type: 'gen', target: 'lemonade', mult: 3, cost: 600,
    name: 'Premium Lemons', flavor: 'Lemonade Stand output ×3.',
    req: { gen: 'lemonade', owned: 10 } },
  { id: 'up_truck1', type: 'gen', target: 'foodtruck', mult: 3, cost: 12000,
    name: 'Franchise It', flavor: 'Food Truck output ×3.',
    req: { gen: 'foodtruck', owned: 10 } },
  { id: 'up_sweat1', type: 'gen', target: 'sweatshop', mult: 3, cost: 200000,
    name: '"Wage Review" (Downward)', flavor: 'Sweatshop output ×3. The review found they were overpaid.',
    req: { gen: 'sweatshop', owned: 10 } },
  { id: 'up_rent1', type: 'gen', target: 'rentco', mult: 3, cost: 3000000,
    name: 'Jack Up the Rent', flavor: 'Rent-Seeking LLC output ×3. They can always pay more.',
    req: { gen: 'rentco', owned: 10 } },
  { id: 'up_hedge1', type: 'gen', target: 'hedgefund', mult: 3, cost: 50000000,
    name: 'Insider "Research"', flavor: 'Hedge Fund output ×3. Best not to ask.',
    req: { gen: 'hedgefund', owned: 10 } },
  { id: 'up_pe1', type: 'gen', target: 'privateequity', mult: 3, cost: 800000000,
    name: 'Strip and Flip', flavor: 'Private Equity output ×3. The pension was just sitting there.',
    req: { gen: 'privateequity', owned: 10 } },

  // --- Global: gate behind lifetime earnings. ---
  { id: 'glob_capture', type: 'global', mult: 2, cost: 1000000,
    name: 'Regulatory Capture', flavor: 'Write the rules, then dutifully follow them. ×2 all income.',
    req: { money: 500000 } },
  { id: 'glob_tax', type: 'global', mult: 2, cost: 500000000,
    name: 'Effective Tax Rate: 0%', flavor: 'Keep every cent. ×2 all income.',
    req: { money: 200000000 } },
  { id: 'glob_narrative', type: 'global', mult: 3, cost: 100000000000,
    name: 'Control the Narrative', flavor: "They'll thank you for it. ×3 all income.",
    req: { money: 50000000000 } },
  { id: 'glob_bailout', type: 'global', mult: 3, cost: 10000000000000,
    name: 'Privatize Gains, Socialize Losses', flavor: '×3 all income. What could possibly go wrong?',
    req: { money: 5000000000000 } },

  // --- Wage cuts: lower the share paid to workers. Your cut goes up; their line shrinks. ---
  { id: 'wage_review', type: 'wagecut', cut: 0.05, cost: 500000,
    name: 'Performance Review (Everyone Fails)', flavor: 'A rigorous, fair process. Wages −5%.',
    req: { money: 250000 } },
  { id: 'offshore', type: 'wagecut', cut: 0.05, cost: 10000000,
    name: 'Offshore the Whole Department', flavor: 'Same work, a tenth of the pay. Wages −5%.',
    req: { money: 5000000 } },
  { id: 'gig', type: 'wagecut', cut: 0.05, cost: 500000000,
    name: "Reclassify Them as 'Contractors'", flavor: 'No benefits, no overtime, no problem. Wages −5%.',
    req: { money: 250000000 } },
  { id: 'union', type: 'wagecut', cut: 0.05, cost: 20000000000,
    name: 'Bust the Union', flavor: 'Consultants are expensive, but worth it. Wages −5%.',
    req: { money: 10000000000 } },
  { id: 'automate', type: 'wagecut', cut: 0.05, cost: 1000000000000,
    name: 'Automate Their Jobs (Keep the Output)', flavor: 'The machine does not ask for a raise. Wages −5%.',
    req: { money: 500000000000 } },
  { id: 'intern', type: 'wagecut', cut: 0.03, cost: 20000000000000,
    name: 'Unpaid "Internships"', flavor: "It's an opportunity, really. Wages −3%.",
    req: { money: 10000000000000 } },
];

export function upgradeById(id) {
  return upgrades.find((u) => u.id === id);
}

/** Is an upgrade revealed yet? Gated by owning N of a generator and/or lifetime earnings. */
export function isUnlocked(u, owned, earnedTotal) {
  if (u.req?.gen && (owned[u.req.gen] || 0) < u.req.owned) return false;
  if (u.req?.money && earnedTotal.lt(u.req.money)) return false;
  return true;
}

function productOf(filterFn, purchased) {
  let m = new Decimal(1);
  for (const u of upgrades) {
    if (purchased[u.id] && filterFn(u)) m = m.mul(u.mult);
  }
  return m;
}

/** Combined multiplier on all income from purchased global upgrades. */
export function globalMultiplier(purchased) {
  return productOf((u) => u.type === 'global', purchased);
}

/** Combined multiplier on a single generator's output. */
export function genMultiplier(genId, purchased) {
  return productOf((u) => u.type === 'gen' && u.target === genId, purchased);
}

/** Combined multiplier on the manual click value. */
export function clickMultiplier(purchased) {
  return productOf((u) => u.type === 'click', purchased);
}

/** Total reduction to the wage rate from purchased wage-cut upgrades. */
export function wageCutTotal(purchased) {
  let cut = 0;
  for (const u of upgrades) {
    if (purchased[u.id] && u.type === 'wagecut') cut += u.cut;
  }
  return cut;
}
