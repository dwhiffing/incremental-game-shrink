import React, { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

const TARGET_VALUE = 10000
const getCost = (baseCost, level, pow = 1.15) =>
  Math.floor(baseCost * Math.pow(pow, level))

function App() {
  const intervalRef = useRef()
  const interval2Ref = useRef()
  const [state, setState] = useState({
    progress: 0,
    money: 0,
    upgrade: 1,
    tickLevel: 0,
    level: 1,
  })

  const costs = {
    level: getCost(5, state.level - 1),
    tickLevel: getCost(150, state.tickLevel, 2),
    upgrade: getCost(1000, state.upgrade - 1, 2),
  }
  const contentLabels = {
    level: `$${state.level * state.upgrade} per tick`,
    tickLevel: `one tick every ${1000 - state.tickLevel * 100}ms`,
    upgrade: `money x ${state.upgrade}`,
  }
  const buttonLabels = {
    level: 'Upgrade',
    tickLevel: 'Upgrade tick',
    upgrade: 'Doubler',
  }
  const validators = {
    level: state.money < costs.level,
    tickLevel: state.money < costs.tickLevel || state.tickLevel >= 9,
    upgrade: state.money < costs.upgrade,
  }
  const unlocks = {
    level: 0,
    tickLevel: 150,
    upgrade: 1000,
  }

  const purchase = (key) => {
    if (costs[key] <= state.money) {
      setState((s) => ({
        ...s,
        [key]: s[key] + 1,
        money: s.money - costs[key],
      }))
    }
  }

  const onTick = () => {
    setState((oldState) => {
      return {
        ...oldState,
        money: oldState.money + oldState.level * oldState.upgrade,
      }
    })
  }

  const onTick2 = useCallback(() => {
    const tick = 1000 - state.tickLevel * 100
    setState((oldState) => {
      const penalty = 1 - oldState.progress / TARGET_VALUE
      const increment = oldState.level * oldState.upgrade * penalty
      return {
        ...oldState,
        progress: oldState.progress + increment / (tick / 10),
      }
    })
  }, [state.tickLevel])

  useEffect(() => {
    const tick = 1000 - state.tickLevel * 100
    intervalRef.current && clearInterval(intervalRef.current)
    intervalRef.current = setInterval(onTick, tick)
    return () => {
      clearInterval(intervalRef.current)
    }
  }, [state.tickLevel])

  useEffect(() => {
    interval2Ref.current && clearInterval(interval2Ref.current)
    interval2Ref.current = setInterval(onTick2, 10)
    return () => {
      clearInterval(interval2Ref.current)
    }
  }, [onTick2])

  const percent = Math.min(100, (state.progress + 1) / 100)

  return (
    <div>
      <div className="menu">
        <p style={{ margin: '10px' }}>money: ${state.money}</p>
        <p style={{ margin: '10px' }}>progress: {percent.toFixed(4) + '%'}</p>
        {Object.keys(costs).map(
          (key) =>
            state.progress >= unlocks[key] && (
              <div
                key={key}
                style={{
                  margin: '10px',
                  display: 'flex',
                  height: 40,
                  alignItems: 'center',
                }}
              >
                <div style={{ width: 250 }}>
                  <p>{[contentLabels[key]]}</p>
                </div>
                <button
                  onClick={() => purchase(key)}
                  disabled={validators[key]}
                  style={{ width: 150, height: 35 }}
                >
                  {[buttonLabels[key]]} (${costs[key]})
                </button>
              </div>
            ),
        )}
      </div>
      <section>
        <div className="container">
          <p
            style={{
              fontSize: '10vw',
              transform: `scale(${Math.max(1, TARGET_VALUE - state.progress)})`,
              left: '-1.2vw',
              top: `${(100 - percent) * 50}%`,
            }}
          >
            If you can read this you win!
          </p>
        </div>
      </section>
    </div>
  )
}

export default App
