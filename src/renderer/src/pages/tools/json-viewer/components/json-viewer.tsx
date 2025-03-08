import { useState, useEffect } from 'react';
import ReactJson from 'react-json-view';

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
      setError('JSON 解析错误: ' + (err as Error).message);
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
        setError('JSON 解析错误: ' + (err as Error).message);
        setJsonData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setJsonInput('');
    setJsonData(null);
    setError(null);
  };

  return (
    <div className="json-viewer">
      <div className="json-input-section">
        <div className="input-header">
          <h3>输入 JSON</h3>
          <div className="input-actions">
            <input 
              type="file" 
              id="json-file" 
              accept=".json" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
            <label htmlFor="json-file" className="button upload-button">
              上传 JSON 文件
            </label>
            <button className="button clear-button" onClick={handleClear}>
              清空
            </button>
          </div>
        </div>
        <textarea
          value={jsonInput}
          onChange={handleInputChange}
          placeholder="在此粘贴 JSON 数据..."
          className="json-textarea"
        />
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="json-output-section">
        <h3>JSON 查看器</h3>
        <div className="json-view-container">
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
            <div className="empty-state">
              {error ? '请修复 JSON 错误' : '请输入有效的 JSON 数据'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 