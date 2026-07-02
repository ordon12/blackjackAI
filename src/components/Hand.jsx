import Card from './Card.jsx'
import { handValue } from '../utils/hand.js'

export default function Hand({ cards, label, hideSecond = false, chip }) {
  const { total, soft } = handValue(cards.filter((_, i) => !(hideSecond && i === 1)))

  return (
    <div className="hand">
      <div className="hand__label-row">
        <span className="hand__label">{label}</span>
        {!hideSecond && (
          <span className="hand__total">
            {total}
            {soft ? ' (soft)' : ''}
            {total > 21 ? ' — bust' : ''}
          </span>
        )}
        {chip}
      </div>
      <div className="hand__cards">
        {cards.map((card, i) => (
          <Card
            key={card.id + i}
            card={card}
            hidden={hideSecond && i === 1}
            delay={i * 120}
          />
        ))}
      </div>
    </div>
  )
}
