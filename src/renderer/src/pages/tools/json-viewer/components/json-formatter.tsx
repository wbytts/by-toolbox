import { useState } from 'react';
import styles from '../json-viewer.module.scss';

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
      
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setFormattedJson(formatted);
      setError(null);
    } catch (err) {
      setError('JSON 格式错误，请检查输入');
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
      
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      setFormattedJson(minified);
      setError(null);
    } catch (err) {
      setError('JSON 格式错误，请检查输入');
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
    // 重置文件输入，以便可以再次选择同一文件
    e.target.value = '';
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
          alert('复制失败，请手动复制');
        });
    }
  };

  const handleDownload = () => {
    if (formattedJson) {
      const blob = new Blob([formattedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={styles.jsonFormatter}>
      <div className={styles.formatterInputSection}>
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

      <div className={styles.formatterOutputSection}>
        <div className={styles.formatterActions}>
          <div className={styles.indentSelector}>
            <label htmlFor="indent-size">缩进大小:</label>
            <select
              id="indent-size"
              className={styles.indentSelect}
              value={indentSize}
              onChange={handleIndentChange}
            >
              <option value="2">2 空格</option>
              <option value="4">4 空格</option>
              <option value="8">8 空格</option>
              <option value="0">无缩进</option>
            </select>
          </div>
          <div className={styles.outputActions}>
            <button 
              className={`${styles.button} ${styles.formatButton}`}
              onClick={formatJson}
              disabled={!jsonInput.trim()}
            >
              格式化
            </button>
            <button 
              className={`${styles.button} ${styles.minifyButton}`}
              onClick={minifyJson}
              disabled={!jsonInput.trim()}
            >
              压缩
            </button>
            <button 
              className={`${styles.button} ${styles.copyButton}`}
              onClick={handleCopy}
              disabled={!formattedJson}
            >
              复制
            </button>
            <button 
              className={`${styles.button} ${styles.downloadButton}`}
              onClick={handleDownload}
              disabled={!formattedJson}
            >
              下载
            </button>
          </div>
        </div>
        <div className={styles.formattedOutput}>
          {formattedJson ? (
            <pre>{formattedJson}</pre>
          ) : (
            <div className={styles.placeholderText}>
              点击"格式化"或"压缩"按钮处理 JSON 数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 