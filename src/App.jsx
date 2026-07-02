import Hand from './components/Hand.jsx'
import Controls from './components/Controls.jsx'
import StrategyTable from './components/StrategyTable.jsx'
import MonteCarloBar from './components/MonteCarloBar.jsx'
import { useBlackjack } from './hooks/useBlackjack.js'
import { handValue, cardValue } from './utils/hand.js'

export default function App() {
  const {
    playerCards,
    dealerCards,
    phase,
    message,
    bankroll,
    bet,
    mcResult,
    mcRunning,
    newRound,
    hit,
    stand,
    double,
    canDouble,
  } = useBlackjack()

  const { total: playerTotal, soft: playerSoft } = handValue(playerCards)
  const dealerUpcardValue =
    dealerCards.length > 0 ? cardValue(dealerCards[0].rank) : null

  return (
    <div className="table-root">
      <header className="site-header">
        <h1>Blackjack AI</h1>
        <p className="site-sub">DP strategy table · live Monte Carlo simulation</p>
        <div className="bankroll">
          Bankroll <strong>${bankroll}</strong> · Bet ${bet}
        </div>
      </header>

      <section className="felt">
        <Hand cards={dealerCards} label="Dealer" hideSecond={phase === 'player'} />
        <div className="message-strip">{message}</div>
        <Hand cards={playerCards} label="You" />
        <Controls
          onHit={hit}
          onStand={stand}
          onDouble={double}
          onNewRound={newRound}
          canDouble={canDouble}
          phase={phase}
        />
      </section>

      {phase === 'player' && playerCards.length > 0 && (
        <section className="dsa-panels">
          <StrategyTable
            activeTotal={playerTotal > 21 ? 21 : playerTotal}
            activeSoft={playerSoft}
            activeUpcard={dealerUpcardValue}
          />
          <MonteCarloBar result={mcResult} running={mcRunning} />
        </section>
      )}

      <footer className="site-footer">
        Built with a DP-solved strategy chart and a 2,000-iteration Monte Carlo
        estimator, recomputed after every card.
      </footer>
    </div>
  )
}
