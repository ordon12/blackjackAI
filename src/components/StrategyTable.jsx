import { STRATEGY_TABLE } from '../utils/strategy.js'

const UPCARDS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const upcardLabel = (v) => (v === 11 ? 'A' : v)
const actionLabel = (a) => ({ hit: 'H', stand: 'S', double: 'D' }[a])

export default function StrategyTable({ activeTotal, activeSoft, activeUpcard }) {
  const rows = activeSoft
    ? Object.keys(STRATEGY_TABLE.soft)
        .map(Number)
        .sort((a, b) => a - b)
    : Object.keys(STRATEGY_TABLE.hard)
        .map(Number)
        .sort((a, b) => a - b)

  const section = activeSoft ? STRATEGY_TABLE.soft : STRATEGY_TABLE.hard

  return (
    <div className="strategy-panel">
      <div className="panel-header">
        <h3>DP Strategy Table</h3>
        <span className="panel-sub">
          {activeSoft ? 'Soft totals' : 'Hard totals'} · O(1) lookup per decision
        </span>
      </div>
      <div className="strategy-table-scroll">
        <table className="strategy-table">
          <thead>
            <tr>
              <th>You \ Dealer</th>
              {UPCARDS.map((u) => (
                <th key={u} className={u === activeUpcard ? 'is-active-col' : ''}>
                  {upcardLabel(u)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((total) => (
              <tr key={total} className={total === activeTotal ? 'is-active-row' : ''}>
                <th>{total}</th>
                {UPCARDS.map((u) => {
                  const action = section[total][u]
                  const isActive = total === activeTotal && u === activeUpcard
                  return (
                    <td
                      key={u}
                      className={`action-${action} ${isActive ? 'is-active-cell' : ''}`}
                    >
                      {actionLabel(action)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="legend">
        <span><i className="action-hit" /> Hit</span>
        <span><i className="action-stand" /> Stand</span>
        <span><i className="action-double" /> Double</span>
      </div>
    </div>
  )
}
