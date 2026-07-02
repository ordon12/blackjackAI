// ---------------------------------------------------------------------------
// DP STRATEGY TABLE
// ---------------------------------------------------------------------------
// We model the dealer and player as Markov-like states and solve for the
// optimal action with memoized recursion (= dynamic programming: overlapping
// subproblems + optimal substructure). We assume an infinite shoe (fixed card
// probabilities) which is the standard simplification basic-strategy charts
// use — it keeps the state space tiny (a few hundred states) and lets the
// whole table solve in well under a millisecond.
// ---------------------------------------------------------------------------

// Infinite-deck card probabilities: ranks 2-9 each 1/13, any 10-value card
// (10/J/Q/K) is 4/13, Ace is 1/13.
const CARD_PROBS = [
  { value: 2, p: 1 / 13 },
  { value: 3, p: 1 / 13 },
  { value: 4, p: 1 / 13 },
  { value: 5, p: 1 / 13 },
  { value: 6, p: 1 / 13 },
  { value: 7, p: 1 / 13 },
  { value: 8, p: 1 / 13 },
  { value: 9, p: 1 / 13 },
  { value: 10, p: 4 / 13 },
  { value: 11, p: 1 / 13 }, // Ace, counted soft (11) initially
]

function applyCard(total, soft, value) {
  let newTotal = total + value
  let newSoft = soft || value === 11
  // If an ace was just added as 11 and we've busted, or we're carrying a
  // soft ace and bust, downgrade one ace from 11 -> 1.
  while (newTotal > 21 && newSoft) {
    newTotal -= 10
    // We only track "has at least one soft ace still countable as 11".
    // Once downgraded, re-check if any more sofness remains is not tracked
    // precisely (infinite-deck simplification), so we just drop soft flag.
    newSoft = false
  }
  return { total: newTotal, soft: newSoft }
}

// ---- Dealer outcome distribution (DP, memoized on total+soft) ----
const dealerMemo = new Map()

function dealerOutcomeDist(total, soft) {
  const key = `${total}-${soft}`
  if (dealerMemo.has(key)) return dealerMemo.get(key)

  if (total > 21) {
    const dist = { bust: 1, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0 }
    dealerMemo.set(key, dist)
    return dist
  }

  // Dealer stands on all 17s (including soft 17) here for simplicity.
  if (total >= 17) {
    const dist = { bust: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0 }
    dist[total] = 1
    dealerMemo.set(key, dist)
    return dist
  }

  // Hit: recurse over every possible next card, weighted by probability.
  const dist = { bust: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0 }
  for (const { value, p } of CARD_PROBS) {
    const next = applyCard(total, soft, value)
    const sub = dealerOutcomeDist(next.total, next.soft)
    for (const k of Object.keys(dist)) {
      dist[k] += p * sub[k]
    }
  }
  dealerMemo.set(key, dist)
  return dist
}

export function dealerBustProbability(upcardValue) {
  // Upcard alone (hole card unknown) is the standard starting state used to
  // build basic-strategy charts.
  const soft = upcardValue === 11
  return dealerOutcomeDist(upcardValue, soft).bust
}

function standEV(playerTotal, upcardValue) {
  if (playerTotal > 21) return -1
  const soft = upcardValue === 11
  const dist = dealerOutcomeDist(upcardValue, soft)
  let ev = dist.bust * 1
  for (const total of [17, 18, 19, 20, 21]) {
    if (playerTotal > total) ev += dist[total] * 1
    else if (playerTotal === total) ev += dist[total] * 0
    else ev += dist[total] * -1
  }
  return ev
}

// ---- Player EV (DP, memoized on total+soft+upcard) ----
const playerMemo = new Map()

function bestPlayerEV(total, soft, upcardValue) {
  if (total > 21) return -1
  const key = `${total}-${soft}-${upcardValue}`
  if (playerMemo.has(key)) return playerMemo.get(key)

  const stand = standEV(total, upcardValue)

  // Placeholder prevents infinite recursion is unnecessary here since hitting
  // always strictly increases total, so there's no cycle — safe to recurse.
  let hit = 0
  for (const { value, p } of CARD_PROBS) {
    const next = applyCard(total, soft, value)
    hit += p * bestPlayerEV(next.total, next.soft, upcardValue)
  }

  const best = Math.max(stand, hit)
  playerMemo.set(key, best)
  return best
}

function hitEV(total, soft, upcardValue) {
  let hit = 0
  for (const { value, p } of CARD_PROBS) {
    const next = applyCard(total, soft, value)
    hit += p * bestPlayerEV(next.total, next.soft, upcardValue)
  }
  return hit
}

// Double = draw exactly one card then forced stand, but the win/loss is
// worth 2x. We compare 2x that forced line against the best of stand/hit.
function doubleEV(total, soft, upcardValue) {
  let ev = 0
  for (const { value, p } of CARD_PROBS) {
    const next = applyCard(total, soft, value)
    ev += p * standEV(next.total, upcardValue) * 2
  }
  return ev
}

export function getAction(playerTotal, soft, upcardValue, canDouble) {
  const stand = standEV(playerTotal, upcardValue)
  const hit = hitEV(playerTotal, soft, upcardValue)
  let best = stand >= hit ? 'stand' : 'hit'
  let bestEV = Math.max(stand, hit)

  if (canDouble) {
    const dbl = doubleEV(playerTotal, soft, upcardValue)
    if (dbl > bestEV) {
      best = 'double'
      bestEV = dbl
    }
  }
  return best
}

// Precompute the full chart once at module load: rows = player totals 4-21
// (hard) and soft totals (as "soft-13".."soft-20"), cols = dealer upcards 2-11.
export function buildStrategyTable() {
  const upcards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  const table = { hard: {}, soft: {} }

  for (let total = 4; total <= 20; total++) {
    table.hard[total] = {}
    for (const up of upcards) {
      table.hard[total][up] = getAction(total, false, up, true)
    }
  }

  for (let total = 13; total <= 20; total++) {
    table.soft[total] = {}
    for (const up of upcards) {
      table.soft[total][up] = getAction(total, true, up, true)
    }
  }

  return table
}

export const STRATEGY_TABLE = buildStrategyTable()
