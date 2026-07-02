import { isRed } from '../utils/deck.js'

export default function Card({ card, hidden = false, delay = 0 }) {
  if (hidden) {
    return (
      <div className="card card--hidden" style={{ animationDelay: `${delay}ms` }}>
        <div className="card__back-pattern" />
      </div>
    )
  }

  const red = isRed(card.suit)

  return (
    <div
      className={`card ${red ? 'card--red' : 'card--black'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="card__corner card__corner--top">
        {card.rank}
        <br />
        {card.suit}
      </span>
      <span className="card__suit-large">{card.suit}</span>
      <span className="card__corner card__corner--bottom">
        {card.rank}
        <br />
        {card.suit}
      </span>
    </div>
  )
}
