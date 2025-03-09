import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import './styles/global.css' // 导入全局样式

const rootDOM = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootDOM)

root.render(
    <App />
)
