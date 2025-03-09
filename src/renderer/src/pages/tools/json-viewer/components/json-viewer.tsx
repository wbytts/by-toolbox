import { useState, useEffect } from 'react';
import ReactJson from 'react-json-view';
import styles from '../json-viewer.module.scss';

export const JsonViewer = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonData, setJsonData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // 检测系统主题
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDarkMode ? 'dark' : 'light');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    try {
      if (e.target.value.trim() === '') {
        setJsonData(null);
        setError(null);
        return;
      }
      const parsed = JSON.parse(e.target.value);
      setJsonData(parsed);
      setError(null);
    } catch (err) {
      setError('JSON 格式错误，请检查输入');
      setJsonData(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setJsonInput(content);
        const parsed = JSON.parse(content);
        setJsonData(parsed);
        setError(null);
      } catch (err) {
        setError('JSON 格式错误，请检查文件内容');
        setJsonData(null);
      }
    };
    reader.readAsText(file);
    // 重置文件输入，以便可以再次选择同一文件
    e.target.value = '';
  };

  const handleClear = () => {
    setJsonInput('');
    setJsonData(null);
    setError(null);
  };

  return (
    <div className={styles.jsonViewer}>
      <div className={styles.jsonInputSection}>
        <div className={styles.inputHeader}>
          <h3>输入 JSON</h3>
          <div className={styles.inputActions}>
            <label className={`${styles.button} ${styles.uploadButton}`}>
              上传文件
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
            <button 
              className={`${styles.button} ${styles.clearButton}`}
              onClick={handleClear}
            >
              清空
            </button>
          </div>
        </div>
        <textarea
          className={styles.jsonTextarea}
          value={jsonInput}
          onChange={handleInputChange}
          placeholder="在此粘贴或输入 JSON 数据..."
        />
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>

      <div className={styles.jsonOutputSection}>
        <div className={styles.outputHeader}>
          <h3>JSON 视图</h3>
        </div>
        <div className={styles.jsonViewContainer}>
          {jsonData ? (
            <ReactJson 
              src={jsonData} 
              theme={theme === 'dark' ? 'monokai' : 'rjv-default'} 
              displayDataTypes={false}
              enableClipboard={true}
              collapsed={false}
              name={null}
            />
          ) : (
            <div className={styles.emptyState}>
              <p>在左侧输入 JSON 数据以查看格式化结果</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 