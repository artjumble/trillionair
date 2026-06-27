// Idle income generators.
//
// PHASE 1 (the loop builds this): define 3-4 generators, each:
//   { id, name, flavor, baseCost, costMult (1.07-1.15), baseIncome, owned }
// cost(n) = baseCost * costMult^owned ; income = baseIncome * owned * multipliers.
// Themed to the satire (e.g. Lemonade Stand -> ... -> Lobbying Firm / Hedge Fund).
//
// Kept empty in the scaffold so the skeleton loads clean. Do not import heavy logic
// until Phase 1 wires it into state.js and ui.js.

export const generators = [];
