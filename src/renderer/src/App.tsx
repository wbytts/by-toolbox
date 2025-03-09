import { HashRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import './App.css'
import JsonViewerTool from './pages/tools/json-viewer'
import BookmarkManager from './pages/tools/bookmark-manager'
import CodeSnippetManager from './pages/tools/code-snippet-manager'
import NodeManager from './pages/tools/node-manager'
import EnvManager from './pages/tools/env-manager'
import ProjectManager from './pages/tools/project-manager'
import TitleBar from './components/app-top-header'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <HashRouter>
      <div className="app-container">
        <TitleBar />
        <div className="app-content">
          <nav className="app-sidebar">
            <ul className="nav-list">
              <li className="nav-item">
                <NavLink to="/tools/json-viewer" className={({ isActive }) => isActive ? 'active' : ''}>
                  JSON 查看器
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tools/bookmark-manager" className={({ isActive }) => isActive ? 'active' : ''}>
                  网址收藏
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tools/code-snippet-manager" className={({ isActive }) => isActive ? 'active' : ''}>
                  代码段管理
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tools/node-manager" className={({ isActive }) => isActive ? 'active' : ''}>
                  Node环境管理
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tools/env-manager" className={({ isActive }) => isActive ? 'active' : ''}>
                  系统环境变量
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tools/project-manager" className={({ isActive }) => isActive ? 'active' : ''}>
                  项目管理
                </NavLink>
              </li>
              {/* 未来可以在这里添加更多工具链接 */}
            </ul>
          </nav>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/tools/json-viewer" replace />} />
              <Route path="/tools/json-viewer" element={<JsonViewerTool />} />
              <Route path="/tools/bookmark-manager" element={<BookmarkManager />} />
              <Route path="/tools/code-snippet-manager" element={<CodeSnippetManager />} />
              <Route path="/tools/node-manager" element={<NodeManager />} />
              <Route path="/tools/env-manager" element={<EnvManager />} />
              <Route path="/tools/project-manager" element={<ProjectManager />} />
              {/* 未来可以在这里添加更多工具路由 */}
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  )
}

export default App
