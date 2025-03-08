import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import JsonViewerTool from './pages/tools/json-viewer'
import BookmarkManager from './pages/tools/bookmark-manager'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="app-content">
          <nav className="app-sidebar">
            <ul className="nav-list">
              <li className="nav-item">
                <a href="/tools/json-viewer">JSON 查看器</a>
              </li>
              <li className="nav-item">
                <a href="/tools/bookmark-manager">网址收藏</a>
              </li>
              {/* 未来可以在这里添加更多工具链接 */}
            </ul>
          </nav>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/tools/json-viewer" replace />} />
              <Route path="/tools/json-viewer" element={<JsonViewerTool />} />
              <Route path="/tools/bookmark-manager" element={<BookmarkManager />} />
              {/* 未来可以在这里添加更多工具路由 */}
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
