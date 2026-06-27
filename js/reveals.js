// "You didn't build this" reveals: one-time messages that fire as you cross wealth
// milestones, puncturing the self-made myth. The fortune was extracted, not earned alone.
//
// Pure data + a pure check. Fired state lives in state.js (state.reveals).

export const reveals = [
  { id: 'r_million', money: 1e6,
    text: "Self-made? Every cent here moved on roads you didn't pave and wires you didn't lay." },
  { id: 'r_hundredmillion', money: 1e8,
    text: "Each dollar passed through hands you'll never shake — and never pay what they're worth." },
  { id: 'r_billion', money: 1e9,
    text: "No one earns a billion dollars. You collected it, from a system you didn't design and a workforce you didn't thank." },
  { id: 'r_hundredbillion', money: 1e11,
    text: 'The "genius" was being early, being lucky, and owning the part where the money lands.' },
  { id: 'r_trillion', money: 1e12,
    text: "A trillion dollars. You didn't build this — nobody could. It was gathered, a dollar at a time, from everyone else." },
];

/** Mark and return any reveals newly unlocked by the current money. Mutates `fired`. */
export function checkReveals(money, fired) {
  const newly = [];
  for (const r of reveals) {
    if (!fired[r.id] && money.gte(r.money)) {
      fired[r.id] = true;
      newly.push(r);
    }
  }
  return newly;
}
