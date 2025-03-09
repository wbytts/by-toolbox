import React, { useState, useEffect } from 'react';
import styles from '../env-manager.module.scss';

interface PathEditorProps {
  value: string;
  onChange: (value: string) => void;
  variableName: string;
  disabled?: boolean;
}

/**
 * 智能路径编辑组件
 * 对于PATH类型的环境变量，提供多输入框界面，方便用户单独编辑每个路径
 * 对于其他变量，提供普通文本框
 */
const PathEditor: React.FC<PathEditorProps> = ({ value, onChange, variableName, disabled }) => {
  // 检测当前操作系统是否为Windows
  const isWindows = (): boolean => {
    const platform = window.navigator.platform.toLowerCase();
    return platform.includes('win');
  };
  
  // 检测是否是PATH类型的环境变量
  const isPathVariable = (name: string, value: string): boolean => {
    // 检查变量名是否为PATH或Path相关
    const isPathName = /^path$/i.test(name);
    
    // 检查是否包含多个路径分隔符
    const separator = isWindows() ? ';' : ':';
    const hasSeparator = value.includes(separator);
    
    return isPathName && hasSeparator;
  };
  
  const isPathLike = isPathVariable(variableName, value);
  
  // 如果不是PATH类型，使用普通文本框
  if (!isPathLike) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.valueTextarea}
        rows={3}
        disabled={disabled}
      />
    );
  }
  
  // 确定分隔符（Windows使用分号，Unix使用冒号）
  const separator = isWindows() ? ';' : ':';
  
  // 拆分路径
  const [paths, setPaths] = useState<string[]>(value.split(separator).filter(Boolean));
  
  // 当路径数组变化时，更新父组件的值
  useEffect(() => {
    onChange(paths.join(separator));
  }, [paths, separator, onChange]);
  
  // 添加新路径
  const addPath = () => {
    setPaths([...paths, '']);
  };
  
  // 删除路径
  const removePath = (index: number) => {
    const newPaths = [...paths];
    newPaths.splice(index, 1);
    setPaths(newPaths);
  };
  
  // 更新路径
  const updatePath = (index: number, newValue: string) => {
    const newPaths = [...paths];
    newPaths[index] = newValue;
    setPaths(newPaths);
  };
  
  // 移动路径
  const movePath = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === paths.length - 1)
    ) {
      return;
    }
    
    const newPaths = [...paths];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newPaths[index], newPaths[targetIndex]] = [newPaths[targetIndex], newPaths[index]];
    setPaths(newPaths);
  };
  
  return (
    <div className={styles.pathEditor}>
      <div className={styles.pathList}>
        {paths.map((path, index) => (
          <div key={index} className={styles.pathItem}>
            <input
              type="text"
              value={path}
              onChange={(e) => updatePath(index, e.target.value)}
              className={styles.pathInput}
              disabled={disabled}
            />
            <div className={styles.pathActions}>
              <button
                onClick={() => movePath(index, 'up')}
                disabled={disabled || index === 0}
                className={styles.pathButton}
                title="上移"
              >
                ↑
              </button>
              <button
                onClick={() => movePath(index, 'down')}
                disabled={disabled || index === paths.length - 1}
                className={styles.pathButton}
                title="下移"
              >
                ↓
              </button>
              <button
                onClick={() => removePath(index)}
                disabled={disabled}
                className={styles.pathButton}
                title="删除"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={addPath}
        disabled={disabled}
        className={styles.addPathButton}
      >
        添加路径
      </button>
    </div>
  );
};

export default PathEditor; 