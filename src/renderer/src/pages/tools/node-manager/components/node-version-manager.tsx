import React, { useState, useEffect } from 'react';
import styles from '../node-manager.module.scss';

interface NodeVersion {
  version: string;
  current: boolean;
}

export const NodeVersionManager: React.FC = () => {
  const [installedVersions, setInstalledVersions] = useState<NodeVersion[]>([]);
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAvailable, setLoadingAvailable] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [versionToInstall, setVersionToInstall] = useState<string>('');

  // 获取已安装版本
  const fetchInstalledVersions = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await window.api.nodeManager.getInstalledVersions();
      console.log("获取已安装版本结果：", result);
      
      if (result.error) {
        setError(`获取已安装版本失败: ${result.error}`);
        return;
      }
      
      if (!result.data || result.data.trim() === '') {
        setError('未找到已安装的Node.js版本，请确认nvm已正确安装并已安装Node.js版本');
        return;
      }
      
      // 解析nvm list输出
      const versions: NodeVersion[] = [];
      const lines = result.data.split('\n');
      
      console.log("解析行数：", lines.length);
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue; // 跳过空行
        
        console.log("处理行：", trimmedLine);
        
        // 检查是否为当前使用的版本（带有星号标记）
        const isCurrent = trimmedLine.startsWith('*');
        
        // 提取版本号 - 匹配数字.数字.数字格式
        const versionMatch = trimmedLine.match(/\d+\.\d+\.\d+/);
        if (versionMatch) {
          const version = `v${versionMatch[0]}`; // 添加v前缀以保持一致性
          console.log(`找到版本: ${version}, 当前使用: ${isCurrent}`);
          versions.push({ version, current: isCurrent });
        }
      }
      
      console.log("解析到的版本：", versions);
      
      if (versions.length === 0) {
        setError('未能从输出中解析出任何Node.js版本');
        return;
      }
      
      setInstalledVersions(versions);
    } catch (err: any) {
      setError(`获取已安装版本出错: ${err.message}`);
      console.error("获取版本异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 获取可用版本
  const fetchAvailableVersions = async () => {
    setLoadingAvailable(true);
    setError('');
    try {
      const result = await window.api.nodeManager.getAvailableVersions();
      console.log("获取可用版本结果：", result);
      
      if (result.error) {
        setError(`获取可用版本失败: ${result.error}`);
        return;
      }
      
      if (!result.data || result.data.trim() === '') {
        setError('未能获取到可用的Node.js版本列表');
        return;
      }
      
      // 解析版本列表
      const versions: string[] = [];
      const lines = result.data.split('\n');
      
      console.log("解析可用版本行数：", lines.length);
      
      // 检查是否是从官方网站获取的版本列表（每行一个版本号，格式为vX.Y.Z）
      const isFromWebsite = lines.some(line => /^v\d+\.\d+\.\d+$/.test(line.trim()));
      
      if (isFromWebsite) {
        // 从官方网站获取的版本列表，直接使用
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          if (/^v\d+\.\d+\.\d+$/.test(trimmedLine)) {
            console.log(`找到可用版本: ${trimmedLine}`);
            versions.push(trimmedLine);
          }
        }
      } else {
        // nvm list available输出通常包含多个版本区块
        let inVersionBlock = false;
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue; // 跳过空行
          
          console.log("处理可用版本行：", trimmedLine);
          
          // 检查是否是版本区块标题行
          if (trimmedLine.includes('|')) {
            inVersionBlock = true;
            continue;
          }
          
          if (inVersionBlock) {
            // 提取所有版本号
            const versionMatches = trimmedLine.match(/\d+\.\d+\.\d+/g);
            if (versionMatches) {
              versionMatches.forEach(version => {
                const versionWithPrefix = `v${version}`;
                console.log(`找到可用版本: ${versionWithPrefix}`);
                versions.push(versionWithPrefix);
              });
            }
          }
        }
      }
      
      console.log("解析到的可用版本：", versions);
      
      if (versions.length === 0) {
        setError('未能从输出中解析出任何可用的Node.js版本');
        return;
      }
      
      // 按版本号排序（从高到低）
      const sortedVersions = [...versions].sort((a, b) => {
        const aVer = a.substring(1).split('.').map(Number);
        const bVer = b.substring(1).split('.').map(Number);
        
        // 主版本号比较
        if (aVer[0] !== bVer[0]) return bVer[0] - aVer[0];
        // 次版本号比较
        if (aVer[1] !== bVer[1]) return bVer[1] - aVer[1];
        // 补丁版本号比较
        return bVer[2] - aVer[2];
      });
      
      // 按主版本号分组
      const groupedVersions: { [key: string]: string[] } = {};
      sortedVersions.forEach(version => {
        const majorVersion = version.match(/v(\d+)\./)?.[1] || 'unknown';
        if (!groupedVersions[majorVersion]) {
          groupedVersions[majorVersion] = [];
        }
        groupedVersions[majorVersion].push(version);
      });
      
      // 只保留每个主版本号的最新几个版本
      const filteredVersions: string[] = [];
      Object.keys(groupedVersions).sort((a, b) => Number(b) - Number(a)).forEach(majorVersion => {
        // 每个主版本保留最多5个最新版本
        filteredVersions.push(...groupedVersions[majorVersion].slice(0, 5));
      });
      
      setAvailableVersions(filteredVersions);
    } catch (err: any) {
      setError(`获取可用版本出错: ${err.message}`);
      console.error("获取可用版本异常：", err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  // 安装新版本
  const installNodeVersion = async (version: string) => {
    setStatusMessage(`正在安装 ${version}...`);
    setError('');
    setLoading(true);
    
    try {
      const result = await window.api.nodeManager.installVersion(version);
      if (result.error) {
        setError(`安装 ${version} 失败: ${result.error}`);
      } else {
        setStatusMessage(`${version} 安装成功!`);
        // 刷新已安装版本列表
        await fetchInstalledVersions();
      }
    } catch (err: any) {
      setError(`安装过程出错: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 切换Node版本
  const useNodeVersion = async (version: string) => {
    setStatusMessage(`正在切换到 ${version}...`);
    setError('');
    setLoading(true);
    
    try {
      const result = await window.api.nodeManager.useVersion(version);
      if (result.error) {
        setError(`切换到 ${version} 失败: ${result.error}`);
      } else {
        setStatusMessage(`已切换到 ${version}`);
        // 刷新已安装版本列表
        await fetchInstalledVersions();
      }
    } catch (err: any) {
      setError(`切换版本过程出错: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 卸载版本
  const uninstallNodeVersion = async (version: string) => {
    if (!confirm(`确定要卸载 ${version} 吗?`)) {
      return;
    }
    
    setStatusMessage(`正在卸载 ${version}...`);
    setError('');
    setLoading(true);
    
    try {
      const result = await window.api.nodeManager.uninstallVersion(version);
      if (result.error) {
        setError(`卸载 ${version} 失败: ${result.error}`);
      } else {
        setStatusMessage(`${version} 已成功卸载`);
        // 刷新已安装版本列表
        await fetchInstalledVersions();
      }
    } catch (err: any) {
      setError(`卸载过程出错: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchInstalledVersions();
  }, []);

  return (
    <div className={styles.nodeVersionManager}>
      <div className={styles.sectionHeader}>
        <h2>Node.js 版本管理</h2>
        <div className={styles.actionButtons}>
          <button 
            className={styles.refreshButton} 
            onClick={fetchInstalledVersions} 
            disabled={loading}
          >
            刷新
          </button>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {statusMessage && <div className={styles.statusMessage}>{statusMessage}</div>}

      <div className={styles.sectionContainer}>
        <div className={styles.installedVersions}>
          <h3>已安装版本</h3>
          {loading ? (
            <div className={styles.loading}>加载中...</div>
          ) : (
            <div className={styles.versionList}>
              {installedVersions.length === 0 ? (
                <div className={styles.emptyMessage}>没有找到已安装的Node.js版本</div>
              ) : (
                installedVersions.map((version) => (
                  <div key={version.version} className={styles.versionItem}>
                    <span className={`${styles.versionName} ${version.current ? styles.currentVersion : ''}`}>
                      {version.version} {version.current && <span className={styles.currentLabel}>(当前)</span>}
                    </span>
                    <div className={styles.versionActions}>
                      {!version.current && (
                        <>
                          <button 
                            onClick={() => useNodeVersion(version.version)}
                            disabled={loading}
                            className={styles.useButton}
                          >
                            使用
                          </button>
                          <button 
                            onClick={() => uninstallNodeVersion(version.version)}
                            disabled={loading}
                            className={styles.uninstallButton}
                          >
                            卸载
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className={styles.availableVersions}>
          <h3>可用版本</h3>
          <div className={styles.actionButtons}>
            <button 
              className={styles.refreshButton} 
              onClick={fetchAvailableVersions} 
              disabled={loadingAvailable}
            >
              {loadingAvailable ? '加载中...' : '获取可用版本'}
            </button>
          </div>

          {loadingAvailable ? (
            <div className={styles.loading}>加载可用版本中...</div>
          ) : (
            <>
              {availableVersions.length > 0 ? (
                <div className={styles.versionSelector}>
                  <select 
                    value={versionToInstall} 
                    onChange={(e) => setVersionToInstall(e.target.value)}
                    className={styles.versionSelect}
                  >
                    <option value="">选择版本...</option>
                    {(() => {
                      // 按主版本号分组
                      const groups: { [key: string]: string[] } = {};
                      availableVersions.forEach(version => {
                        const majorVersion = version.match(/v(\d+)\./)?.[1] || 'unknown';
                        if (!groups[majorVersion]) {
                          groups[majorVersion] = [];
                        }
                        groups[majorVersion].push(version);
                      });
                      
                      // 生成选项组
                      return Object.keys(groups)
                        .sort((a, b) => Number(b) - Number(a)) // 主版本号从高到低排序
                        .map(majorVersion => (
                          <optgroup key={majorVersion} label={`Node.js ${majorVersion}.x`}>
                            {groups[majorVersion].map(version => (
                              <option key={version} value={version}>{version}</option>
                            ))}
                          </optgroup>
                        ));
                    })()}
                  </select>
                  <button
                    onClick={() => versionToInstall && installNodeVersion(versionToInstall)}
                    disabled={!versionToInstall || loading}
                    className={styles.installButton}
                  >
                    安装选定版本
                  </button>
                </div>
              ) : (
                <div className={styles.emptyMessage}>点击"获取可用版本"按钮查看</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 