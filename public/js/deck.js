const suits = ["hearts", "diamonds", "clubs", "spades"];
const ranks = ["K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2", "A"];

export function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

export function calculateRankValue(rank) {
  return ranks.indexOf(rank);
}
