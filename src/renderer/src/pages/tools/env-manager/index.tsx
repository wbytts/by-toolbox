import React, { useState, useEffect } from 'react';
import styles from './env-manager.module.scss';

interface EnvVariable {
  name: string;
  value: string;
  type: 'user' | 'system';
}

const EnvManager: React.FC = () => {
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [newVarName, setNewVarName] = useState<string>('');
  const [newVarValue, setNewVarValue] = useState<string>('');
  const [newVarType, setNewVarType] = useState<'user' | 'system'>('user');
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'user' | 'system'>('all');

  // 获取环境变量
  const fetchEnvVariables = async () => {
    setLoading(true);
    setError('');
    setStatusMessage('获取环境变量...');

    try {
      // 使用实际API获取环境变量
      const result = await window.api.envManager.getEnvVariables();
      
      if (result.error) {
        setError(`获取环境变量失败: ${result.error}`);
        return;
      }
      
      if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
        setStatusMessage('未找到环境变量');
        setVariables([]);
        return;
      }
      
      setVariables(result.data);
      setStatusMessage('环境变量获取成功');
    } catch (err: any) {
      setError(`获取环境变量出错: ${err.message}`);
      console.error("获取环境变量异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 设置环境变量
  const setEnvVariable = async (name: string, value: string, type: 'user' | 'system') => {
    setLoading(true);
    setError('');
    setStatusMessage(`正在设置环境变量 ${name}...`);

    try {
      // 使用实际API设置环境变量
      const result = await window.api.envManager.setEnvVariable(name, value, type);
      
      if (result.error) {
        setError(`设置环境变量失败: ${result.error}`);
        return;
      }
      
      if (result.warning) {
        setStatusMessage(`环境变量设置成功，但有警告: ${result.warning}`);
      } else {
        setStatusMessage(`成功设置环境变量 ${name}`);
      }
      
      // 更新本地状态
      setVariables(prev => {
        const exists = prev.some(v => v.name === name && v.type === type);
        if (exists) {
          return prev.map(v => (v.name === name && v.type === type) ? { ...v, value } : v);
        } else {
          return [...prev, { name, value, type }];
        }
      });
      
      // 退出编辑模式
      setEditMode(prev => ({ ...prev, [`${type}-${name}`]: false }));
    } catch (err: any) {
      setError(`设置环境变量出错: ${err.message}`);
      console.error("设置环境变量异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 删除环境变量
  const deleteEnvVariable = async (name: string, type: 'user' | 'system') => {
    if (!confirm(`确定要删除${type === 'user' ? '用户' : '系统'}环境变量 ${name} 吗?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage(`正在删除环境变量 ${name}...`);

    try {
      // 使用实际API删除环境变量
      const result = await window.api.envManager.deleteEnvVariable(name, type);
      
      if (result.error) {
        setError(`删除环境变量失败: ${result.error}`);
        return;
      }
      
      if (result.warning) {
        setStatusMessage(`环境变量删除成功，但有警告: ${result.warning}`);
      } else {
        setStatusMessage(`成功删除环境变量 ${name}`);
      }
      
      // 更新本地状态
      setVariables(prev => prev.filter(v => !(v.name === name && v.type === type)));
    } catch (err: any) {
      setError(`删除环境变量出错: ${err.message}`);
      console.error("删除环境变量异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 添加新环境变量
  const addNewEnvVariable = async () => {
    if (!newVarName.trim()) {
      setError('环境变量名称不能为空');
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage(`正在添加环境变量 ${newVarName}...`);

    try {
      // 使用实际API添加环境变量
      const result = await window.api.envManager.setEnvVariable(newVarName, newVarValue, newVarType);
      
      if (result.error) {
        setError(`添加环境变量失败: ${result.error}`);
        return;
      }
      
      // 检查是否已存在
      const exists = variables.some(v => v.name === newVarName && v.type === newVarType);
      
      if (result.warning) {
        setStatusMessage(`环境变量${exists ? '更新' : '添加'}成功，但有警告: ${result.warning}`);
      } else {
        setStatusMessage(`成功${exists ? '更新' : '添加'}环境变量 ${newVarName}`);
      }
      
      // 更新本地状态
      setVariables(prev => {
        if (exists) {
          return prev.map(v => (v.name === newVarName && v.type === newVarType) ? { ...v, value: newVarValue } : v);
        } else {
          return [...prev, { name: newVarName, value: newVarValue, type: newVarType }];
        }
      });
      
      setNewVarName('');
      setNewVarValue('');
    } catch (err: any) {
      setError(`添加环境变量出错: ${err.message}`);
      console.error("添加环境变量异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 进入编辑模式
  const enterEditMode = (name: string, type: 'user' | 'system', currentValue: string) => {
    const key = `${type}-${name}`;
    setEditMode(prev => ({ ...prev, [key]: true }));
    setEditValues(prev => ({ ...prev, [key]: currentValue }));
  };

  // 取消编辑
  const cancelEdit = (name: string, type: 'user' | 'system') => {
    const key = `${type}-${name}`;
    setEditMode(prev => ({ ...prev, [key]: false }));
  };

  // 过滤变量
  const filteredVariables = variables.filter(v => {
    // 根据选项卡过滤
    if (activeTab !== 'all' && v.type !== activeTab) {
      return false;
    }
    
    // 根据搜索词过滤
    if (searchTerm && !v.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !v.value.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // 初始加载
  useEffect(() => {
    fetchEnvVariables();
  }, []);

  return (
    <div className={styles.envManager}>
      <div className={styles.envHeader}>
        <h1>系统环境变量管理</h1>
      </div>

      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'all' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('all')}
        >
          所有变量
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'user' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('user')}
        >
          用户变量
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'system' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('system')}
        >
          系统变量
        </button>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.sectionHeader}>
          <h2>环境变量</h2>
          <div className={styles.actionButtons}>
            <button 
              className={styles.refreshButton} 
              onClick={fetchEnvVariables} 
              disabled={loading}
            >
              刷新
            </button>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {statusMessage && <div className={styles.statusMessage}>{statusMessage}</div>}

        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="搜索环境变量..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.variableList}>
          {loading && variables.length === 0 ? (
            <div className={styles.loading}>加载中...</div>
          ) : (
            <>
              {filteredVariables.length === 0 ? (
                <div className={styles.emptyMessage}>
                  {searchTerm ? '没有找到匹配的环境变量' : '没有找到环境变量'}
                </div>
              ) : (
                <div className={styles.variableItems}>
                  {filteredVariables.map((variable) => (
                    <div key={`${variable.type}-${variable.name}`} className={styles.variableItem}>
                      <div className={styles.variableInfo}>
                        <div className={styles.variableName}>
                          {variable.name}
                          <span className={variable.type === 'user' ? styles.userBadge : styles.systemBadge}>
                            {variable.type === 'user' ? '用户' : '系统'}
                          </span>
                        </div>
                        {editMode[`${variable.type}-${variable.name}`] ? (
                          <div className={styles.editForm}>
                            <textarea
                              value={editValues[`${variable.type}-${variable.name}`]}
                              onChange={(e) => setEditValues(prev => ({ 
                                ...prev, 
                                [`${variable.type}-${variable.name}`]: e.target.value 
                              }))}
                              className={styles.valueTextarea}
                              rows={3}
                            />
                            <div className={styles.editActions}>
                              <button
                                onClick={() => setEnvVariable(
                                  variable.name, 
                                  editValues[`${variable.type}-${variable.name}`], 
                                  variable.type
                                )}
                                disabled={loading}
                                className={styles.applyButton}
                              >
                                保存
                              </button>
                              <button
                                onClick={() => cancelEdit(variable.name, variable.type)}
                                disabled={loading}
                                className={styles.refreshButton}
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.variableValue}>{variable.value}</div>
                        )}
                      </div>
                      {!editMode[`${variable.type}-${variable.name}`] && (
                        <div className={styles.variableActions}>
                          <button 
                            onClick={() => enterEditMode(variable.name, variable.type, variable.value)}
                            disabled={loading}
                            className={styles.useButton}
                          >
                            编辑
                          </button>
                          <button 
                            onClick={() => deleteEnvVariable(variable.name, variable.type)}
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

        <div className={styles.addVariableForm}>
          <h3>添加/更新环境变量</h3>
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="变量名称"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              disabled={loading}
              className={styles.inputField}
            />
            <textarea
              placeholder="变量值"
              value={newVarValue}
              onChange={(e) => setNewVarValue(e.target.value)}
              disabled={loading}
              className={styles.valueTextarea}
              rows={3}
            />
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="varType"
                  checked={newVarType === 'user'}
                  onChange={() => setNewVarType('user')}
                  disabled={loading}
                  className={styles.radioInput}
                />
                用户变量
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="varType"
                  checked={newVarType === 'system'}
                  onChange={() => setNewVarType('system')}
                  disabled={loading}
                  className={styles.radioInput}
                />
                系统变量
              </label>
            </div>
            <button
              onClick={addNewEnvVariable}
              disabled={loading || !newVarName.trim()}
              className={styles.addButton}
            >
              添加/更新
            </button>
          </div>
        </div>

        <div className={styles.envDescription}>
          <h3>关于环境变量</h3>
          <p>
            环境变量是在操作系统中用来指定操作系统运行环境的一些参数。环境变量分为用户变量和系统变量：
          </p>
          <ul>
            <li><strong>用户变量</strong>: 仅对当前用户有效</li>
            <li><strong>系统变量</strong>: 对所有用户有效</li>
          </ul>
          <p>
            常见的环境变量包括：
          </p>
          <ul>
            <li><strong>PATH</strong>: 指定命令搜索路径</li>
            <li><strong>TEMP/TMP</strong>: 临时文件目录</li>
            <li><strong>JAVA_HOME</strong>: Java安装目录</li>
            <li><strong>USERPROFILE</strong>: 用户主目录</li>
          </ul>
          <p className={styles.warningText}>
            注意：修改系统环境变量需要管理员权限，且修改某些关键环境变量可能会影响系统稳定性。
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnvManager; 