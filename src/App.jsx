import { useState, useEffect, useCallback } from 'react'
import './App.css'

function App() {
  const [nwnStatus, setNwnStatus] = useState('loading')
  const [nwnResponseTime, setNwnResponseTime] = useState(null)
  const [nwnLastChecked, setNwnLastChecked] = useState(null)

  const checkNwnServerStatus = useCallback(async () => {
    setNwnStatus('loading')
    setNwnResponseTime(null)
    const startTime = performance.now()

    try {
      const response = await fetch('/api/server-status', {
        method: 'GET',
        cache: 'no-cache',
      })

      const endTime = performance.now()
      const timeTaken = Math.round(endTime - startTime)

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()

      if (data.online) {
        setNwnStatus('online')
        setNwnResponseTime(timeTaken)
      } else {
        setNwnStatus('offline')
        setNwnResponseTime(null)
      }

      setNwnLastChecked(new Date())
    } catch (error) {
      console.error('Server status check failed:', error)
      setNwnStatus('offline')
      setNwnResponseTime(null)
      setNwnLastChecked(new Date())
    }
  }, [])

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
