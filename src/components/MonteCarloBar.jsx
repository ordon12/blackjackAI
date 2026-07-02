export default function MonteCarloBar({ result, running }) {
  const win = result ? Math.round(result.winProb * 100) : 0
  const push = result ? Math.round(result.pushProb * 100) : 0
  const loss = result ? Math.max(0, 100 - win - push) : 0

  return (
    <div className="montecarlo-panel">
      <div className="panel-header">
        <h3>Monte Carlo Win Estimate</h3>
        <span className="panel-sub">
          {running ? 'simulating…' : `${result?.iterations ?? 0} random playouts`}
        </span>
      </div>
      <div className="mc-bar">
        <div className="mc-bar__win" style={{ width: `${win}%` }} />
        <div className="mc-bar__push" style={{ width: `${push}%` }} />
        <div className="mc-bar__loss" style={{ width: `${loss}%` }} />
      </div>
      <div className="mc-legend">
        <span><i className="mc-swatch mc-swatch--win" /> Win {win}%</span>
        <span><i className="mc-swatch mc-swatch--push" /> Push {push}%</span>
        <span><i className="mc-swatch mc-swatch--loss" /> Loss {loss}%</span>
      </div>
    </div>
  )
}
