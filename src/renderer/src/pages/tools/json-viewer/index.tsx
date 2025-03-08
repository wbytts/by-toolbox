import { useState } from 'react';
import { JsonViewer } from './components/json-viewer';
import { JsonFormatter } from './components/json-formatter';
import './json-viewer.css';

const JsonViewerTool = () => {
  const [activeTab, setActiveTab] = useState<'viewer' | 'formatter'>('viewer');

  return (
    <div className="json-tool-container">
      <div className="json-tool-header">
        <h1>JSON 工具</h1>
        <div className="json-tool-tabs">
          <button 
            className={`tab-button ${activeTab === 'viewer' ? 'active' : ''}`}
            onClick={() => setActiveTab('viewer')}
          >
            JSON 查看器
          </button>
          <button 
            className={`tab-button ${activeTab === 'formatter' ? 'active' : ''}`}
            onClick={() => setActiveTab('formatter')}
          >
            JSON 格式化
          </button>
        </div>
      </div>

      <div className="json-tool-content">
        {activeTab === 'viewer' ? <JsonViewer /> : <JsonFormatter />}
      </div>
    </div>
  );
};

export default JsonViewerTool; 