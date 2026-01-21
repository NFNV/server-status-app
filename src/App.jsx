import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
import { fetchServerStatus } from './api/statusApi'

function App() {
  // State for server status
  const [nwnStatus, setNwnStatus] = useState('loading')
  const isCheckingRef = useRef(false)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    const updateViewportWidth = () => {
      const width = window.visualViewport?.width || window.innerWidth
      document.documentElement.style.setProperty('--app-width', `${Math.round(width)}px`)
    }

    const scheduleUpdate = () => {
      requestAnimationFrame(updateViewportWidth)
    }

    updateViewportWidth()

    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('orientationchange', scheduleUpdate)

    const visualViewport = window.visualViewport
    if (visualViewport) {
      visualViewport.addEventListener('resize', scheduleUpdate)
      visualViewport.addEventListener('scroll', scheduleUpdate)
    }

    return () => {
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('orientationchange', scheduleUpdate)
      if (visualViewport) {
        visualViewport.removeEventListener('resize', scheduleUpdate)
        visualViewport.removeEventListener('scroll', scheduleUpdate)
      }
    }
  }, [])

  /**
   * Check NWN server status by calling the backend API
   * Refreshes every 15 seconds automatically
   */
  const checkNwnServerStatus = useCallback(async ({ forceLoading = false } = {}) => {
    if (isCheckingRef.current) {
      return
    }

    isCheckingRef.current = true

    if (!hasLoadedRef.current || forceLoading) {
      setNwnStatus('loading')
    }

    try {
      // Fetch status from the VM backend API
      const result = await fetchServerStatus()

      if (result.ok) {
        const statusData = result.data
        // Update status based on the response
        setNwnStatus(statusData.online ? 'online' : 'offline')
      } else {
        setNwnStatus('offline')
      }

      hasLoadedRef.current = true
    } catch (error) {
      // This should rarely happen since fetchServerStatus handles errors
      console.error('Unexpected error checking server status:', error)
      setNwnStatus('offline')
      hasLoadedRef.current = true
    } finally {
      isCheckingRef.current = false
    }
  }, [])

  // Initial check and polling interval
  useEffect(() => {
    checkNwnServerStatus({ forceLoading: true })

    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      checkNwnServerStatus()
    }, 15000)

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
              </div>
            )}

            {nwnStatus === 'offline' && (
              <div className="status-card offline">
                <div className="status-indicator">
                  <span className="dot offline"></span>
                  <h3>OFFLINE</h3>
                </div>
              </div>
            )}

            <button
              onClick={() => checkNwnServerStatus({ forceLoading: true })}
              className="refresh-button"
            >
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
          Auto-refreshing every 15 seconds
        </p>
      </div>
    </div>
  )
}

export default App
