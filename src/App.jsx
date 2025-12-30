import { useState, useEffect, useCallback } from 'react'
import './App.css'

function App() {
  const nwnServerUrl = 'http://34.39.183.45:5121'
  const [nwnStatus, setNwnStatus] = useState('loading')
  const [nwnResponseTime, setNwnResponseTime] = useState(null)
  const [nwnLastChecked, setNwnLastChecked] = useState(null)

  const checkNwnServerStatus = useCallback(async () => {
    setNwnStatus('loading')
    setNwnResponseTime(null)
    const startTime = performance.now()

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 10000)
    })

    const fetchPromise = fetch(nwnServerUrl, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
    })

    try {
      await Promise.race([fetchPromise, timeoutPromise])

      const endTime = performance.now()
      const timeTaken = Math.round(endTime - startTime)

      setNwnStatus('online')
      setNwnResponseTime(timeTaken)
      setNwnLastChecked(new Date())
    } catch (error) {
      setNwnStatus('offline')
      setNwnResponseTime(null)
      setNwnLastChecked(new Date())
    }
  }, [nwnServerUrl])

  useEffect(() => {
    checkNwnServerStatus()

    const interval = setInterval(() => {
      checkNwnServerStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [checkNwnServerStatus])

  return (
    <div className="app">
      <div className="container">
        <h1>Gaming Servers Status</h1>

        <div className="servers-grid">
          {/* Neverwinter Nights Server */}
          <div className="server-box">
            <h2 className="server-title">Neverwinter Nights</h2>

            {nwnStatus === 'loading' && (
              <div className="status-card loading">
                <div className="status-indicator">
                  <div className="spinner"></div>
                  <h3>Checking...</h3>
                </div>
              </div>
            )}

            {nwnStatus === 'online' && (
              <div className="status-card online">
                <div className="status-indicator">
                  <span className="dot online"></span>
                  <h3>ONLINE</h3>
                </div>
                {nwnResponseTime && (
                  <p className="response-time">{nwnResponseTime}ms</p>
                )}
                {nwnLastChecked && (
                  <p className="last-checked">
                    {nwnLastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}

            {nwnStatus === 'offline' && (
              <div className="status-card offline">
                <div className="status-indicator">
                  <span className="dot offline"></span>
                  <h3>OFFLINE</h3>
                </div>
                {nwnLastChecked && (
                  <p className="last-checked">
                    {nwnLastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}

            <button onClick={checkNwnServerStatus} className="refresh-button">
              Check Again
            </button>
          </div>

          {/* Ryzom Server - Coming Soon */}
          <div className="server-box">
            <h2 className="server-title">Ryzom</h2>

            <div className="status-card coming-soon">
              <div className="status-indicator">
                <span className="dot coming-soon"></span>
                <h3>COMING SOON</h3>
              </div>
              <p className="coming-soon-text">
                Server launching soon
              </p>
            </div>

            <button className="refresh-button" disabled>
              Not Available
            </button>
          </div>
        </div>

        <p className="auto-refresh-note">
          Auto-refreshing every 30 seconds
        </p>
      </div>
    </div>
  )
}

export default App
