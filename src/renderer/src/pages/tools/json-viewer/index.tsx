import { useState } from 'react';
import { JsonViewer } from './components/json-viewer';
import { JsonFormatter } from './components/json-formatter';
import styles from './json-viewer.module.scss';

const JsonViewerTool = () => {
  const [activeTab, setActiveTab] = useState<'viewer' | 'formatter'>('viewer');

  return (
    <div className={styles.jsonToolContainer}>
      <div className={styles.jsonToolHeader}>
        <h1>JSON 工具</h1>
        <div className={styles.jsonToolTabs}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'viewer' ? styles.active : ''}`}
            onClick={() => setActiveTab('viewer')}
          >
            JSON 查看器
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'formatter' ? styles.active : ''}`}
            onClick={() => setActiveTab('formatter')}
          >
            JSON 格式化
          </button>
        </div>
      </div>

      <div className={styles.jsonToolContent}>
        {activeTab === 'viewer' ? <JsonViewer /> : <JsonFormatter />}
      </div>
    </div>
  );
};

export default JsonViewerTool; 