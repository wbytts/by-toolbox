import React, { useState, lazy, Suspense } from 'react';
import { NodeVersionManager } from './components/node-version-manager';
import { NpmMirrorManager } from './components/npm-mirror-manager';
import styles from './node-manager.module.scss';

// 懒加载其他组件
const NpmConfigManager = lazy(() => import('./components/npm-config-manager').then(module => ({ default: module.NpmConfigManager })));
const PnpmConfigManager = lazy(() => import('./components/pnpm-config-manager').then(module => ({ default: module.PnpmConfigManager })));
const GlobalPackagesManager = lazy(() => import('./components/global-packages-manager').then(module => ({ default: module.GlobalPackagesManager })));
const CacheManager = lazy(() => import('./components/cache-manager').then(module => ({ default: module.CacheManager })));

type TabType = 'node' | 'npm-mirror' | 'npm-config' | 'pnpm-config' | 'global-packages' | 'cache';

interface TabInfo {
  id: TabType;
  label: string;
  component: React.ReactNode;
}

const NodeManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('node');

  const tabs: TabInfo[] = [
    {
      id: 'node',
      label: 'Node.js 版本',
      component: <NodeVersionManager />
    },
    {
      id: 'npm-mirror',
      label: 'NPM 镜像源',
      component: <NpmMirrorManager />
    },
    {
      id: 'npm-config',
      label: 'NPM 配置',
      component: (
        <Suspense fallback={<div className={styles.loading}>加载中...</div>}>
          <NpmConfigManager />
        </Suspense>
      )
    },
    {
      id: 'pnpm-config',
      label: 'PNPM 配置',
      component: (
        <Suspense fallback={<div className={styles.loading}>加载中...</div>}>
          <PnpmConfigManager />
        </Suspense>
      )
    },
    {
      id: 'global-packages',
      label: '全局包管理',
      component: (
        <Suspense fallback={<div className={styles.loading}>加载中...</div>}>
          <GlobalPackagesManager />
        </Suspense>
      )
    },
    {
      id: 'cache',
      label: '缓存管理',
      component: (
        <Suspense fallback={<div className={styles.loading}>加载中...</div>}>
          <CacheManager />
        </Suspense>
      )
    }
  ];

  return (
    <div className={styles.nodeManager}>
      <div className={styles.nodeHeader}>
        <h1>Node环境管理</h1>
      </div>
      
      <div className={styles.tabsContainer}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className={styles.contentArea}>
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default NodeManager; 