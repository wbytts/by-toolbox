import React, { useState, useEffect } from 'react';
import styles from '../node-manager.module.scss';

interface PnpmConfig {
  key: string;
  value: string;
  description?: string;
}

export const PnpmConfigManager: React.FC = () => {
  const [configs, setConfigs] = useState<PnpmConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [newConfigKey, setNewConfigKey] = useState<string>('');
  const [newConfigValue, setNewConfigValue] = useState<string>('');
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({});

  // 常用配置项
  const commonConfigs = [
    { key: 'registry', description: 'PNPM包注册表URL' },
    { key: 'store-dir', description: '全局存储目录' },
    { key: 'cache-dir', description: '缓存目录' },
    { key: 'state-dir', description: '状态目录' },
    { key: 'global-dir', description: '全局安装目录' },
    { key: 'virtual-store-dir', description: '虚拟存储目录' },
    { key: 'proxy', description: '代理服务器URL' },
    { key: 'https-proxy', description: 'HTTPS代理服务器URL' },
    { key: 'strict-peer-dependencies', description: '严格对等依赖' },
    { key: 'auto-install-peers', description: '自动安装对等依赖' },
    { key: 'shamefully-hoist', description: '提升依赖' },
    { key: 'node-linker', description: '节点链接器' }
  ];

  // 获取PNPM配置
  const fetchPnpmConfigs = async () => {
    setLoading(true);
    setError('');
    setStatusMessage('获取PNPM配置...');

    try {
      // 模拟从主进程获取配置
      // 实际实现中应该调用window.api.nodeManager.getPnpmConfigs()
      
      // 临时模拟数据
      const mockConfigs = [
        { key: 'registry', value: 'https://registry.npmjs.org/' },
        { key: 'store-dir', value: 'C:\\Users\\User\\.pnpm-store' },
        { key: 'global-dir', value: 'C:\\Users\\User\\AppData\\Local\\pnpm\\global' },
        { key: 'shamefully-hoist', value: 'true' },
        { key: 'node-linker', value: 'hoisted' }
      ];
      
      // 添加描述
      const configsWithDesc = mockConfigs.map(config => {
        const commonConfig = commonConfigs.find(c => c.key === config.key);
        return {
          ...config,
          description: commonConfig?.description || ''
        };
      });
      
      setConfigs(configsWithDesc);
      setStatusMessage('PNPM配置获取成功');
    } catch (err: any) {
      setError(`获取PNPM配置出错: ${err.message}`);
      console.error("获取PNPM配置异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 设置PNPM配置
  const setPnpmConfig = async (key: string, value: string) => {
    setLoading(true);
    setError('');
    setStatusMessage(`正在设置 ${key}=${value}...`);

    try {
      // 模拟设置配置
      // 实际实现中应该调用window.api.nodeManager.setPnpmConfig(key, value)
      
      // 更新本地状态
      setConfigs(prev => prev.map(config => 
        config.key === key ? { ...config, value } : config
      ));
      
      setStatusMessage(`成功设置 ${key}=${value}`);
      
      // 退出编辑模式
      setEditMode(prev => ({ ...prev, [key]: false }));
    } catch (err: any) {
      setError(`设置PNPM配置出错: ${err.message}`);
      console.error("设置PNPM配置异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 删除PNPM配置
  const deletePnpmConfig = async (key: string) => {
    if (!confirm(`确定要删除配置 ${key} 吗?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage(`正在删除配置 ${key}...`);

    try {
      // 模拟删除配置
      // 实际实现中应该调用window.api.nodeManager.deletePnpmConfig(key)
      
      // 更新本地状态
      setConfigs(prev => prev.filter(config => config.key !== key));
      
      setStatusMessage(`成功删除配置 ${key}`);
    } catch (err: any) {
      setError(`删除PNPM配置出错: ${err.message}`);
      console.error("删除PNPM配置异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 添加新配置
  const addNewConfig = async () => {
    if (!newConfigKey.trim()) {
      setError('配置名称不能为空');
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage(`正在添加配置 ${newConfigKey}=${newConfigValue}...`);

    try {
      // 模拟添加配置
      // 实际实现中应该调用window.api.nodeManager.setPnpmConfig(newConfigKey, newConfigValue)
      
      // 检查是否已存在
      const exists = configs.some(config => config.key === newConfigKey);
      
      if (exists) {
        // 更新现有配置
        setConfigs(prev => prev.map(config => 
          config.key === newConfigKey ? { ...config, value: newConfigValue } : config
        ));
      } else {
        // 添加新配置
        const commonConfig = commonConfigs.find(c => c.key === newConfigKey);
        setConfigs(prev => [...prev, { 
          key: newConfigKey, 
          value: newConfigValue,
          description: commonConfig?.description || ''
        }]);
      }
      
      setStatusMessage(`成功${exists ? '更新' : '添加'}配置 ${newConfigKey}=${newConfigValue}`);
      setNewConfigKey('');
      setNewConfigValue('');
    } catch (err: any) {
      setError(`添加PNPM配置出错: ${err.message}`);
      console.error("添加PNPM配置异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 进入编辑模式
  const enterEditMode = (key: string, currentValue: string) => {
    setEditMode(prev => ({ ...prev, [key]: true }));
    setEditValues(prev => ({ ...prev, [key]: currentValue }));
  };

  // 取消编辑
  const cancelEdit = (key: string) => {
    setEditMode(prev => ({ ...prev, [key]: false }));
  };

  // 初始加载
  useEffect(() => {
    fetchPnpmConfigs();
  }, []);

  return (
    <div className={styles.pnpmConfigManager}>
      <div className={styles.sectionHeader}>
        <h2>PNPM 配置管理</h2>
        <div className={styles.actionButtons}>
          <button 
            className={styles.refreshButton} 
            onClick={fetchPnpmConfigs} 
            disabled={loading}
          >
            刷新
          </button>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {statusMessage && <div className={styles.statusMessage}>{statusMessage}</div>}

      <div className={styles.configList}>
        <h3>当前配置</h3>
        {loading && configs.length === 0 ? (
          <div className={styles.loading}>加载中...</div>
        ) : (
          <>
            {configs.length === 0 ? (
              <div className={styles.emptyMessage}>没有找到PNPM配置</div>
            ) : (
              <div className={styles.configItems}>
                {configs.map((config) => (
                  <div key={config.key} className={styles.configItem}>
                    <div className={styles.configInfo}>
                      <div className={styles.configKey}>{config.key}</div>
                      {config.description && (
                        <div className={styles.configDescription}>{config.description}</div>
                      )}
                      {editMode[config.key] ? (
                        <div className={styles.editForm}>
                          <input
                            type="text"
                            value={editValues[config.key]}
                            onChange={(e) => setEditValues(prev => ({ ...prev, [config.key]: e.target.value }))}
                            className={styles.inputField}
                          />
                          <div className={styles.editActions}>
                            <button
                              onClick={() => setPnpmConfig(config.key, editValues[config.key])}
                              disabled={loading}
                              className={styles.applyButton}
                            >
                              保存
                            </button>
                            <button
                              onClick={() => cancelEdit(config.key)}
                              disabled={loading}
                              className={styles.refreshButton}
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.configValue}>{config.value || <em>未设置</em>}</div>
                      )}
                    </div>
                    {!editMode[config.key] && (
                      <div className={styles.configActions}>
                        <button 
                          onClick={() => enterEditMode(config.key, config.value)}
                          disabled={loading}
                          className={styles.useButton}
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => deletePnpmConfig(config.key)}
                          disabled={loading}
                          className={styles.deleteButton}
                        >
                          删除
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.addConfigForm}>
        <h3>添加/更新配置</h3>
        <div className={styles.formGroup}>
          <select
            value={newConfigKey}
            onChange={(e) => setNewConfigKey(e.target.value)}
            className={styles.configSelect}
          >
            <option value="">选择配置项...</option>
            {commonConfigs.map(config => (
              <option key={config.key} value={config.key}>
                {config.key} - {config.description}
              </option>
            ))}
            <option value="custom">自定义...</option>
          </select>
          {newConfigKey === 'custom' && (
            <input
              type="text"
              placeholder="配置名称"
              value=""
              onChange={(e) => setNewConfigKey(e.target.value)}
              className={styles.inputField}
            />
          )}
          <input
            type="text"
            placeholder="配置值"
            value={newConfigValue}
            onChange={(e) => setNewConfigValue(e.target.value)}
            className={styles.inputField}
          />
          <button
            onClick={addNewConfig}
            disabled={loading || !newConfigKey.trim()}
            className={styles.addButton}
          >
            添加/更新
          </button>
        </div>
      </div>
    </div>
  );
}; 