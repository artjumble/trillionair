// Meta-upgrades: permanent advantages bought with Old Money (prestige currency).
// They persist through every reset — the structural head start that compounds across
// "generations." The names make the point: it's not talent, it's inheritance.
//
// Pure data + pure helpers. Purchased state lives in state.js (state.meta).

const Decimal = window.Decimal;

export const metaUpgrades = [
  { id: 'trustfund', cost: 1, type: 'income', mult: 2,
    name: 'Trust Fund', flavor: 'Every life begins ahead. ×2 all income, forever.' },
  { id: 'ivy', cost: 2, type: 'click', mult: 3,
    name: 'Ivy League Connections', flavor: "It's who you know. ×3 click value." },
  { id: 'thirdbase', cost: 2, type: 'startcash', amount: 100000,
    name: 'Born on Third Base', flavor: 'Inherit $100K of seed money after every reset.' },
  { id: 'familyname', cost: 4, type: 'income', mult: 3,
    name: 'The Family Name', flavor: 'Doors open themselves. ×3 all income.' },
  { id: 'oldboys', cost: 10, type: 'income', mult: 5,
    name: "Old Boys' Club", flavor: 'Membership has its privileges. ×5 all income.' },
  { id: 'compounding', cost: 8, type: 'synergy', per: 0.02,
    name: 'Generational Compounding', flavor: 'Advantage breeds advantage. +2% income per Old Money held.' },
  { id: 'estate', cost: 30, type: 'income', mult: 10,
    name: 'The Estate', flavor: 'Nobody works it. It simply grows. ×10 all income.' },
];

export function metaById(id) {
  return metaUpgrades.find((m) => m.id === id);
}

/** Permanent income multiplier from purchased meta-upgrades (synergy scales with held Old Money). */
export function metaIncomeMult(meta, prestigeHeld) {
  let m = new Decimal(1);
  for (const u of metaUpgrades) {
    if (!meta[u.id]) continue;
    if (u.type === 'income') m = m.mul(u.mult);
    else if (u.type === 'synergy') m = m.mul(1 + u.per * prestigeHeld);
  }
  return m;
}

/** Permanent click multiplier from purchased meta-upgrades. */
export function metaClickMult(meta) {
  let m = new Decimal(1);
  for (const u of metaUpgrades) {
    if (meta[u.id] && u.type === 'click') m = m.mul(u.mult);
  }
  return m;
}

/** Seed money granted on each reset from purchased meta-upgrades. */
export function metaStartingCash(meta) {
  let c = new Decimal(0);
  for (const u of metaUpgrades) {
    if (meta[u.id] && u.type === 'startcash') c = c.add(u.amount);
  }
  return c;
}
