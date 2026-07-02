export default function Controls({ onHit, onStand, onDouble, onNewRound, canDouble, phase }) {
  if (phase === 'idle' || phase === 'roundOver') {
    return (
      <div className="controls">
        <button className="btn btn--primary" onClick={onNewRound}>
          Deal next hand
        </button>
      </div>
    )
  }

  return (
    <div className="controls">
      <button className="btn" onClick={onHit}>
        Hit
      </button>
      <button className="btn" onClick={onStand}>
        Stand
      </button>
      <button className="btn btn--outline" onClick={onDouble} disabled={!canDouble}>
        Double
      </button>
    </div>
  )
}
