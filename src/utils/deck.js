// A standard 52-card deck. We keep rank as a string ('2'..'10','J','Q','K','A')
// and derive numeric blackjack value separately, since face cards and 10 share
// a value but need different visuals.

const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

export function createDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${rank}${suit}` })
    }
  }
  return deck
}

// Fisher-Yates shuffle — O(n), unbiased. Mutates a copy, returns it.
export function shuffleDeck(deck) {
  const arr = [...deck]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function isRed(suit) {
  return suit === '♥' || suit === '♦'
}
