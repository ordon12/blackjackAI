// Blackjack hand-value math. The tricky part is Aces: each Ace counts as 11
// unless that would bust the hand, in which case it drops to 1 ("soft" -> "hard").

export function cardValue(rank) {
  if (rank === 'A') return 11
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10
  return parseInt(rank, 10)
}

// Returns { total, soft } where `soft` means an Ace is still being counted as 11.
export function handValue(cards) {
  let total = 0
  let aces = 0

  for (const card of cards) {
    total += cardValue(card.rank)
    if (card.rank === 'A') aces += 1
  }

  // Downgrade Aces from 11 -> 1 one at a time while we're bust and still have
  // a "soft" ace available.
  let softAces = aces
  while (total > 21 && softAces > 0) {
    total -= 10
    softAces -= 1
  }

  return { total, soft: softAces > 0 }
}

export function isBust(cards) {
  return handValue(cards).total > 21
}

export function isBlackjack(cards) {
  return cards.length === 2 && handValue(cards).total === 21
}
