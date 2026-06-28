// The unspendable endgame: absurd luxuries you can buy once you've "earned" a trillion.
// They're priced large — but trivial against $1T, and your income refills faster than you
// can spend. The point is that you cannot empty the account. That's the joke, and the indictment.
//
// Pure data. Owned counts + total spent live in state.js.

export const luxuries = [
  { id: 'senator', price: 25000000, name: 'A Senator',
    flavor: '"Campaign contributions." Fully legal. Mostly.' },
  { id: 'jet', price: 75000000, name: 'Private Jet',
    flavor: 'For when the other jet is being cleaned.' },
  { id: 'mansion', price: 90000000, name: 'Another Mansion',
    flavor: "You'll never set foot in most of the rooms." },
  { id: 'island', price: 250000000, name: 'Private Island',
    flavor: 'Staff not included. (They commute by boat.)' },
  { id: 'newspaper', price: 450000000, name: 'A Newspaper',
    flavor: 'Now the editorials agree with you.' },
  { id: 'yacht', price: 650000000, name: 'Superyacht',
    flavor: 'It has a smaller yacht inside it.' },
  { id: 'pledge', price: 1000000000, name: 'A Pledge to End Hunger',
    flavor: 'You announce it at Davos to applause. You do not, in fact, end hunger.' },
  { id: 'club', price: 4000000000, name: 'A Football Club',
    flavor: 'A trophy that pretends to be a business.' },
  { id: 'space', price: 20000000000, name: 'A Space Program',
    flavor: 'Escape velocity — from gravity, taxes, and accountability.' },
];

export function luxuryById(id) {
  return luxuries.find((l) => l.id === id);
}
