import { useState, useEffect, useCallback } from 'react'
import './App.css'

function App() {
  const serverUrl = 'http://34.39.183.45:5121'
  const [status, setStatus] = useState('loading')
  const [responseTime, setResponseTime] = useState(null)
  const [lastChecked, setLastChecked] = useState(null)

  const checkServerStatus = useCallback(async () => {
    setStatus('loading')
    setResponseTime(null)
    const startTime = performance.now()

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 10000) // 10 second timeout
    })

    const fetchPromise = fetch(serverUrl, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
    })

    try {
      await Promise.race([fetchPromise, timeoutPromise])

      const endTime = performance.now()
      const timeTaken = Math.round(endTime - startTime)

      setStatus('online')
      setResponseTime(timeTaken)
      setLastChecked(new Date())
    } catch (error) {
      setStatus('offline')
      setResponseTime(null)
      setLastChecked(new Date())
    }
  }, [serverUrl])

  useEffect(() => {
    checkServerStatus()

    const interval = setInterval(() => {
      checkServerStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [checkServerStatus])

  return (
    <div className="app">
      <div className="container">
        <h1>Server Status</h1>

        {status === 'loading' && (
          <div className="status-card loading">
            <div className="status-indicator">
              <div className="spinner"></div>
              <h2>Checking Server...</h2>
            </div>
          </div>
        )}

        {status === 'online' && (
          <div className="status-card online">
            <div className="status-indicator">
              <span className="dot online"></span>
              <h2>ONLINE</h2>
            </div>
            {responseTime && (
              <p className="response-time">Response time: {responseTime}ms</p>
            )}
            {lastChecked && (
              <p className="last-checked">
                Last checked: {lastChecked.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        {status === 'offline' && (
          <div className="status-card offline">
            <div className="status-indicator">
              <span className="dot offline"></span>
              <h2>OFFLINE</h2>
            </div>
            {lastChecked && (
              <p className="last-checked">
                Last checked: {lastChecked.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        <button onClick={checkServerStatus} className="refresh-button">
          Check Again
        </button>

        <p className="auto-refresh-note">
          Auto-refreshing every 30 seconds
        </p>
      </div>
    </div>
  )
}

export default App
