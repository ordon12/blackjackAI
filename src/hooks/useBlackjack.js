import { useState, useCallback, useEffect, useRef } from 'react'
import { createDeck, shuffleDeck } from '../utils/deck.js'
import { handValue, isBust, isBlackjack } from '../utils/hand.js'
import { estimateWinProbability } from '../utils/monteCarlo.js'

const DEALER_STANDS_ON = 17

function dealerShouldHit(cards) {
  const { total, soft } = handValue(cards)
  return total < DEALER_STANDS_ON || (total === DEALER_STANDS_ON && soft)
}

export function useBlackjack() {
  const [deck, setDeck] = useState([])
  const [playerCards, setPlayerCards] = useState([])
  const [dealerCards, setDealerCards] = useState([])
  const [phase, setPhase] = useState('idle') // idle | player | dealer | roundOver
  const [message, setMessage] = useState('Press "Deal next hand" to start.')
  const [bankroll, setBankroll] = useState(500)
  const [bet, setBet] = useState(25)
  const [doubled, setDoubled] = useState(false)

  const [mcResult, setMcResult] = useState(null)
  const [mcRunning, setMcRunning] = useState(false)

  const deckRef = useRef([])

  const draw = useCallback(() => {
    const d = deckRef.current
    const card = d.pop()
    deckRef.current = d
    return card
  }, [])

  const newRound = useCallback(() => {
    const fresh = shuffleDeck(createDeck())
    deckRef.current = fresh
    const p1 = fresh.pop()
    const d1 = fresh.pop()
    const p2 = fresh.pop()
    const d2 = fresh.pop()
    deckRef.current = fresh

    setPlayerCards([p1, p2])
    setDealerCards([d1, d2])
    setDoubled(false)
    setPhase('player')
    setMessage('Your move — hit, stand, or double.')
    setDeck(fresh)
  }, [])

  const settleBet = useCallback(
    (outcome) => {
      const wager = doubled ? bet * 2 : bet
      if (outcome === 'win') setBankroll((b) => b + wager)
      else if (outcome === 'lose') setBankroll((b) => b - wager)
      // push -> no change
    },
    [bet, doubled],
  )

  const finishRound = useCallback(
    (finalPlayerCards, finalDealerCards) => {
      const playerTotal = handValue(finalPlayerCards).total
      const dealerTotal = handValue(finalDealerCards).total
      const playerBJ = isBlackjack(finalPlayerCards)
      const dealerBJ = isBlackjack(finalDealerCards)

      let outcome
      let msg
      if (playerTotal > 21) {
        outcome = 'lose'
        msg = 'You busted. Dealer wins.'
      } else if (dealerTotal > 21) {
        outcome = 'win'
        msg = 'Dealer busted. You win!'
      } else if (playerBJ && !dealerBJ) {
        outcome = 'win'
        msg = 'Blackjack! You win.'
      } else if (dealerBJ && !playerBJ) {
        outcome = 'lose'
        msg = 'Dealer has blackjack. You lose.'
      } else if (playerTotal > dealerTotal) {
        outcome = 'win'
        msg = `You win, ${playerTotal} beats ${dealerTotal}.`
      } else if (playerTotal < dealerTotal) {
        outcome = 'lose'
        msg = `Dealer wins, ${dealerTotal} beats ${playerTotal}.`
      } else {
        outcome = 'push'
        msg = `Push at ${playerTotal}.`
      }

      settleBet(outcome)
      setMessage(msg)
      setPhase('roundOver')
    },
    [settleBet],
  )

  const runDealerTurn = useCallback(
    (currentPlayerCards) => {
      setPhase('dealer')
      let cards = [...dealerCards]
      const d = [...deckRef.current]

      const step = () => {
        if (dealerShouldHit(cards)) {
          cards = [...cards, d.pop()]
          deckRef.current = d
          setDealerCards(cards)
          setTimeout(step, 500)
        } else {
          finishRound(currentPlayerCards, cards)
        }
      }
      setTimeout(step, 500)
    },
    [dealerCards, finishRound],
  )

  const hit = useCallback(() => {
    const d = [...deckRef.current]
    const card = d.pop()
    deckRef.current = d
    const next = [...playerCards, card]
    setPlayerCards(next)

    if (isBust(next)) {
      setTimeout(() => finishRound(next, dealerCards), 400)
    }
  }, [playerCards, dealerCards, finishRound])

  const stand = useCallback(() => {
    runDealerTurn(playerCards)
  }, [playerCards, runDealerTurn])

  const double = useCallback(() => {
    setDoubled(true)
    const d = [...deckRef.current]
    const card = d.pop()
    deckRef.current = d
    const next = [...playerCards, card]
    setPlayerCards(next)

    if (isBust(next)) {
      setTimeout(() => finishRound(next, dealerCards), 400)
    } else {
      setTimeout(() => runDealerTurn(next), 400)
    }
  }, [playerCards, dealerCards, finishRound, runDealerTurn])

  // Re-run the Monte Carlo simulation any time the visible cards change
  // during the player's turn.
  useEffect(() => {
    if (phase !== 'player' || playerCards.length === 0) return
    setMcRunning(true)
    // Defer to next tick so the "simulating…" state actually paints.
    const timer = setTimeout(() => {
      const result = estimateWinProbability(playerCards, [dealerCards[0]], 2000)
      setMcResult(result)
      setMcRunning(false)
    }, 120)
    return () => clearTimeout(timer)
  }, [playerCards, dealerCards, phase])

  return {
    playerCards,
    dealerCards,
    phase,
    message,
    bankroll,
    bet,
    doubled,
    mcResult,
    mcRunning,
    newRound,
    hit,
    stand,
    double,
    canDouble: phase === 'player' && playerCards.length === 2 && bankroll >= bet * 2,
  }
}
