const suits = ["hearts", "diamonds", "clubs", "spades"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

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

export function drawCard(deck) {
  return deck.length > 0 ? deck.pop() : null; // คืนค่าไพ่หรือ null ถ้าสำรับว่าง
}