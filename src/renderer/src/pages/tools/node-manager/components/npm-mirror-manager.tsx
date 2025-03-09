import React, { useState, useEffect } from 'react';
import styles from '../node-manager.module.scss';

interface NpmMirror {
  name: string;
  url: string;
  isCurrent: boolean;
}

export const NpmMirrorManager: React.FC = () => {
  const [mirrors, setMirrors] = useState<NpmMirror[]>([]);
  const [currentMirror, setCurrentMirror] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [newMirrorName, setNewMirrorName] = useState<string>('');
  const [newMirrorUrl, setNewMirrorUrl] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');

  // 内置镜像列表，防止误删
  const builtInMirrors = ['npm', 'yarn', 'tencent', 'cnpm', 'taobao', 'npmMirror'];

  // 获取当前和可用的镜像
  const fetchMirrors = async () => {
    setLoading(true);
    setError('');
    setStatusMessage('获取NPM镜像...');
    setTestResult('');

    try {
      // 获取当前镜像
      const currentResult = await window.api.nodeManager.getCurrentMirror();
      console.log("获取当前镜像结果：", currentResult);
      
      if (currentResult.error) {
        setError(`获取当前镜像失败: ${currentResult.error}`);
        return;
      }

      // 获取所有镜像
      const mirrorsResult = await window.api.nodeManager.getNpmMirrors();
      console.log("获取镜像列表结果：", mirrorsResult);
      
      if (mirrorsResult.error) {
        setError(`获取镜像列表失败: ${mirrorsResult.error}`);
        return;
      }

      // 解析当前镜像
      const currentOutput = currentResult.data.trim();
      console.log("当前镜像输出：", currentOutput);
      
      // nrm current 输出可能是 "当前使用的镜像源是: [镜像名称]" 或直接是镜像名称
      let current = '';
      const currentMatch = currentOutput.match(/当前使用的镜像源是:\s*(\S+)/) || 
                          currentOutput.match(/current registry is\s*(\S+)/) ||
                          currentOutput.match(/(\S+)/);
      
      if (currentMatch) {
        current = currentMatch[1];
        // 清除可能的ANSI颜色代码
        current = current.replace(/\u001b\[\d+m/g, '').replace(/\[\d+m/g, '');
        console.log("当前使用的镜像：", current);
      }
      
      setCurrentMirror(current);

      // 解析镜像列表
      const mirrorsList: NpmMirror[] = [];
      const lines = mirrorsResult.data.split('\n');
      
      console.log("解析镜像行数：", lines.length);
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue; // 跳过空行
        
        // 清除ANSI颜色代码
        const cleanLine = trimmedLine.replace(/\u001b\[\d+m/g, '').replace(/\[\d+m/g, '');
        console.log("处理镜像行（清理后）：", cleanLine);
        
        // 尝试多种可能的格式匹配
        // 格式1: * name -> url
        // 格式2: * name --- url
        // 格式3: name --- url
        const mirrorMatch = 
          cleanLine.match(/(\*?)\s*(\S+)\s*->\s*(\S+)/) || 
          cleanLine.match(/(\*?)\s*(\S+)\s*---+\s*(\S+)/) ||
          cleanLine.match(/(\*?)\s*(\S+)\s+(\S+)/);
        
        if (mirrorMatch) {
          const isCurrent = mirrorMatch[1] === '*' || cleanLine.includes('(当前)') || cleanLine.includes('(current)');
          const name = mirrorMatch[2];
          const url = mirrorMatch[3];
          
          console.log(`找到镜像: ${name}, URL: ${url}, 当前使用: ${isCurrent}`);
          
          mirrorsList.push({
            name,
            url,
            isCurrent
          });
        }
      }
      
      console.log("解析到的镜像列表：", mirrorsList);
      
      if (mirrorsList.length === 0) {
        setError('未能从输出中解析出任何NPM镜像');
        return;
      }
      
      setMirrors(mirrorsList);
      setStatusMessage('镜像列表获取成功');
    } catch (err: any) {
      setError(`获取镜像列表出错: ${err.message}`);
      console.error("获取镜像列表异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 使用指定镜像
  const useMirror = async (name: string) => {
    setLoading(true);
    setError('');
    setStatusMessage(`正在切换到 ${name} 镜像...`);
    setTestResult('');
    
    try {
      const result = await window.api.nodeManager.useMirror(name);
      if (result.error) {
        setError(`切换到 ${name} 镜像失败: ${result.error}`);
      } else {
        setStatusMessage(`已成功切换到 ${name} 镜像`);
        // 更新镜像列表
        await fetchMirrors();
      }
    } catch (err: any) {
      setError(`切换镜像出错: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 添加新镜像
  const addMirror = async () => {
    if (!newMirrorName.trim() || !newMirrorUrl.trim()) {
      setError('镜像名称和URL不能为空');
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage(`正在添加镜像 ${newMirrorName}...`);
    setTestResult('');
    
    try {
      const result = await window.api.nodeManager.addMirror(newMirrorName, newMirrorUrl);
      if (result.error) {
        setError(`添加镜像失败: ${result.error}`);
      } else {
        setStatusMessage(`镜像 ${newMirrorName} 添加成功`);
        setNewMirrorName('');
        setNewMirrorUrl('');
        // 更新镜像列表
        await fetchMirrors();
      }
    } catch (err: any) {
      setError(`添加镜像出错: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 删除镜像
  const deleteMirror = async (name: string) => {
    // 防止删除内置镜像和当前使用的镜像
    if (builtInMirrors.includes(name)) {
      setError(`不能删除内置镜像 ${name}`);
      return;
    }

    if (name === currentMirror) {
      setError(`不能删除当前正在使用的镜像 ${name}`);
      return;
    }

    if (!confirm(`确定要删除镜像 ${name} 吗?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage(`正在删除镜像 ${name}...`);
    setTestResult('');
    
    try {
      const result = await window.api.nodeManager.deleteMirror(name);
      if (result.error) {
        setError(`删除镜像失败: ${result.error}`);
      } else {
        setStatusMessage(`镜像 ${name} 删除成功`);
        // 更新镜像列表
        await fetchMirrors();
      }
    } catch (err: any) {
      setError(`删除镜像出错: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 测试镜像速度
  const testMirrorSpeed = async (name: string) => {
    setLoading(true);
    setError('');
    setStatusMessage(`正在测试 ${name} 镜像速度...`);
    setTestResult('');
    
    try {
      const result = await window.api.nodeManager.testMirror(name);
      if (result.error) {
        setError(`测试镜像速度失败: ${result.error}`);
      } else {
        setTestResult(result.data);
        setStatusMessage(`${name} 镜像速度测试完成`);
      }
    } catch (err: any) {
      setError(`测试镜像速度出错: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchMirrors();
  }, []);

  return (
    <div className={styles.npmMirrorManager}>
      <div className={styles.sectionHeader}>
        <h2>NPM 镜像源管理</h2>
        <div className={styles.actionButtons}>
          <button 
            className={styles.refreshButton} 
            onClick={fetchMirrors} 
            disabled={loading}
          >
            刷新
          </button>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {statusMessage && <div className={styles.statusMessage}>{statusMessage}</div>}
      {testResult && <div className={styles.testResult}><pre>{testResult}</pre></div>}

      <div className={styles.mirrorList}>
        <h3>镜像列表</h3>
        {loading && !mirrors.length ? (
          <div className={styles.loading}>加载中...</div>
        ) : (
          <>
            {mirrors.length === 0 ? (
              <div className={styles.emptyMessage}>没有找到NPM镜像</div>
            ) : (
              <div className={styles.mirrorItems}>
                {mirrors.map((mirror) => (
                  <div key={mirror.name} className={styles.mirrorItem}>
                    <div className={styles.mirrorInfo}>
                      <span className={`${styles.mirrorName} ${mirror.isCurrent ? styles.currentMirror : ''}`}>
                        {mirror.name} {mirror.isCurrent && <span className={styles.currentLabel}>(当前)</span>}
                      </span>
                      <span className={styles.mirrorUrl}>{mirror.url}</span>
                    </div>
                    <div className={styles.mirrorActions}>
                      {!mirror.isCurrent && (
                        <button 
                          onClick={() => useMirror(mirror.name)}
                          disabled={loading}
                          className={styles.useButton}
                        >
                          使用
                        </button>
                      )}
                      <button 
                        onClick={() => testMirrorSpeed(mirror.name)}
                        disabled={loading}
                        className={styles.testButton}
                      >
                        测速
                      </button>
                      {!builtInMirrors.includes(mirror.name) && !mirror.isCurrent && (
                        <button 
                          onClick={() => deleteMirror(mirror.name)}
                          disabled={loading}
                          className={styles.deleteButton}
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.addMirrorForm}>
        <h3>添加新镜像</h3>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="镜像名称"
            value={newMirrorName}
            onChange={(e) => setNewMirrorName(e.target.value)}
            disabled={loading}
            className={styles.inputField}
          />
          <input
            type="text"
            placeholder="镜像URL"
            value={newMirrorUrl}
            onChange={(e) => setNewMirrorUrl(e.target.value)}
            disabled={loading}
            className={styles.inputField}
          />
          <button
            onClick={addMirror}
            disabled={loading || !newMirrorName.trim() || !newMirrorUrl.trim()}
            className={styles.addButton}
          >
            添加
          </button>
        </div>
      </div>
    </div>
  );
}; 