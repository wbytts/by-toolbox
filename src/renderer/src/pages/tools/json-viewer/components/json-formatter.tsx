import { useState } from 'react';

export const JsonFormatter = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState<number>(2);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  };

  const handleIndentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIndentSize(Number(e.target.value));
  };

  const formatJson = () => {
    try {
      if (jsonInput.trim() === '') {
        setFormattedJson('');
        setError(null);
        return;
      }
      
      // 解析 JSON 字符串为对象
      const parsedJson = JSON.parse(jsonInput);
      
      // 使用指定的缩进重新格式化
      const formatted = JSON.stringify(parsedJson, null, indentSize);
      
      setFormattedJson(formatted);
      setError(null);
    } catch (err) {
      setError('JSON 解析错误: ' + (err as Error).message);
      setFormattedJson('');
    }
  };

  const minifyJson = () => {
    try {
      if (jsonInput.trim() === '') {
        setFormattedJson('');
        setError(null);
        return;
      }
      
      // 解析 JSON 字符串为对象
      const parsedJson = JSON.parse(jsonInput);
      
      // 不带缩进的紧凑格式
      const minified = JSON.stringify(parsedJson);
      
      setFormattedJson(minified);
      setError(null);
    } catch (err) {
      setError('JSON 解析错误: ' + (err as Error).message);
      setFormattedJson('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setJsonInput('');
    setFormattedJson('');
    setError(null);
  };

  const handleCopy = () => {
    if (formattedJson) {
      navigator.clipboard.writeText(formattedJson)
        .then(() => {
          alert('已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    }
  };

  const handleDownload = () => {
    if (!formattedJson) return;
    
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="json-formatter">
      <div className="formatter-input-section">
        <div className="input-header">
          <h3>输入 JSON</h3>
          <div className="input-actions">
            <input 
              type="file" 
              id="json-format-file" 
              accept=".json" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
            <label htmlFor="json-format-file" className="button upload-button">
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
          placeholder="在此粘贴需要格式化的 JSON 数据..."
          className="json-textarea"
        />
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="formatter-actions">
        <div className="indent-selector">
          <label htmlFor="indent-size">缩进大小:</label>
          <select 
            id="indent-size" 
            value={indentSize} 
            onChange={handleIndentChange}
            className="indent-select"
          >
            <option value="2">2 空格</option>
            <option value="4">4 空格</option>
            <option value="8">8 空格</option>
            <option value="0">无缩进</option>
          </select>
        </div>
        <button className="button format-button" onClick={formatJson}>
          格式化
        </button>
        <button className="button minify-button" onClick={minifyJson}>
          压缩
        </button>
      </div>

      <div className="formatter-output-section">
        <div className="output-header">
          <h3>格式化结果</h3>
          <div className="output-actions">
            <button 
              className="button copy-button" 
              onClick={handleCopy}
              disabled={!formattedJson}
            >
              复制
            </button>
            <button 
              className="button download-button" 
              onClick={handleDownload}
              disabled={!formattedJson}
            >
              下载
            </button>
          </div>
        </div>
        <pre className="formatted-output">
          {formattedJson || <span className="placeholder-text">格式化后的 JSON 将显示在这里</span>}
        </pre>
      </div>
    </div>
  );
}; 