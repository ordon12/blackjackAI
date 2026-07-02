import { createDeck, shuffleDeck } from './deck.js'
import { handValue } from './hand.js'

// Runs N random playouts from the CURRENT known cards to estimate a live
// win probability. Unlike the DP table (which is exact, precomputed once),
// this is recomputed on the fly every time a card is dealt, and it's an
// estimate — the more simulations, the tighter it converges to the true value.

const DEALER_STANDS_ON = 17

function playDealer(deck, dealerCards) {
  const cards = [...dealerCards]
  let idx = 0
  let { total, soft } = handValue(cards)
  while (total < DEALER_STANDS_ON || (total === DEALER_STANDS_ON && soft)) {
    cards.push(deck[idx++])
    ;({ total, soft } = handValue(cards))
  }
  return { total, cardsUsed: idx }
}

// playerCards/dealerUpcard are the REAL cards already seen. We build a fresh
// shuffled deck of the remaining 52 - known cards for each simulation run,
// so we never "peek" at cards the player has already been dealt.
export function estimateWinProbability(playerCards, dealerCards, iterations = 2000) {
  const knownIds = new Set([...playerCards, ...dealerCards].map((c) => c.id))
  const baseRemaining = createDeck().filter((c) => !knownIds.has(c.id))

  let wins = 0
  let pushes = 0
  let losses = 0

  const playerFinal = handValue(playerCards).total
  const playerBusted = playerFinal > 21

  for (let i = 0; i < iterations; i++) {
    if (playerBusted) {
      losses++
      continue
    }
    const shuffled = shuffleDeck(baseRemaining)
    const { total: dealerFinal } = playDealer(shuffled, dealerCards)

    if (dealerFinal > 21 || playerFinal > dealerFinal) wins++
    else if (playerFinal === dealerFinal) pushes++
    else losses++
  }

  return {
    winProb: wins / iterations,
    pushProb: pushes / iterations,
    lossProb: losses / iterations,
    iterations,
  }
}
