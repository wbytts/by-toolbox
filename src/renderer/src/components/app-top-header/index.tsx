import React from 'react'
import './app-top-header.css'

const TitleBar: React.FC = () => {
  const handleMinimize = (): void => {
    window.api.window.minimize()
  }

  const handleMaximize = (): void => {
    window.api.window.maximize()
  }

  const handleClose = (): void => {
    window.api.window.close()
  }

  return (
    <div className="title-bar">
      <div className="title-bar-drag-area">
        <div className="app-title">冰冰工具箱</div>
      </div>
      <div className="window-controls">
        <button className="window-control minimize" onClick={handleMinimize}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect width="10" height="1" x="1" y="5.5" fill="currentColor" />
          </svg>
        </button>
        <button className="window-control maximize" onClick={handleMaximize}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor" />
          </svg>
        </button>
        <button className="window-control close" onClick={handleClose}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M2.5,2.5 L9.5,9.5 M9.5,2.5 L2.5,9.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TitleBar 