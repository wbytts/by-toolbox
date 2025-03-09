import React, { useState, useEffect } from 'react';
import styles from '../node-manager.module.scss';

interface GlobalPackage {
  name: string;
  version: string;
  description?: string;
  location?: string;
}

export const GlobalPackagesManager: React.FC = () => {
  const [packages, setPackages] = useState<GlobalPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [packageToInstall, setPackageToInstall] = useState<string>('');
  const [packageVersion, setPackageVersion] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [packageManager, setPackageManager] = useState<'npm' | 'pnpm' | 'yarn'>('npm');

  // 获取全局安装的包
  const fetchGlobalPackages = async () => {
    setLoading(true);
    setError('');
    setStatusMessage(`获取${packageManager}全局包...`);

    try {
      // 模拟从主进程获取全局包
      // 实际实现中应该调用window.api.nodeManager.getGlobalPackages(packageManager)
      
      // 临时模拟数据
      const mockPackages = [
        { name: 'npm', version: '9.6.7', description: 'npm package manager' },
        { name: 'create-react-app', version: '5.0.1', description: 'Create React App' },
        { name: 'typescript', version: '5.0.4', description: 'TypeScript is a language for application scale JavaScript development' },
        { name: 'eslint', version: '8.40.0', description: 'An AST-based pattern checker for JavaScript' },
        { name: 'prettier', version: '2.8.8', description: 'Prettier is an opinionated code formatter' }
      ];
      
      setPackages(mockPackages);
      setStatusMessage(`${packageManager}全局包获取成功`);
    } catch (err: any) {
      setError(`获取全局包出错: ${err.message}`);
      console.error("获取全局包异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 安装全局包
  const installGlobalPackage = async () => {
    if (!packageToInstall.trim()) {
      setError('包名不能为空');
      return;
    }

    setLoading(true);
    setError('');
    const packageWithVersion = packageVersion ? `${packageToInstall}@${packageVersion}` : packageToInstall;
    setStatusMessage(`正在全局安装 ${packageWithVersion}...`);

    try {
      // 模拟安装全局包
      // 实际实现中应该调用window.api.nodeManager.installGlobalPackage(packageManager, packageToInstall, packageVersion)
      
      // 模拟添加到列表
      const newPackage = {
        name: packageToInstall,
        version: packageVersion || '最新版本',
        description: '新安装的包'
      };
      
      setPackages(prev => [newPackage, ...prev]);
      setStatusMessage(`成功安装 ${packageWithVersion}`);
      setPackageToInstall('');
      setPackageVersion('');
    } catch (err: any) {
      setError(`安装全局包出错: ${err.message}`);
      console.error("安装全局包异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 卸载全局包
  const uninstallGlobalPackage = async (packageName: string) => {
    if (!confirm(`确定要卸载全局包 ${packageName} 吗?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage(`正在卸载全局包 ${packageName}...`);

    try {
      // 模拟卸载全局包
      // 实际实现中应该调用window.api.nodeManager.uninstallGlobalPackage(packageManager, packageName)
      
      // 从列表中移除
      setPackages(prev => prev.filter(pkg => pkg.name !== packageName));
      
      setStatusMessage(`成功卸载全局包 ${packageName}`);
    } catch (err: any) {
      setError(`卸载全局包出错: ${err.message}`);
      console.error("卸载全局包异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 更新全局包
  const updateGlobalPackage = async (packageName: string) => {
    setLoading(true);
    setError('');
    setStatusMessage(`正在更新全局包 ${packageName}...`);

    try {
      // 模拟更新全局包
      // 实际实现中应该调用window.api.nodeManager.updateGlobalPackage(packageManager, packageName)
      
      // 更新版本号
      setPackages(prev => prev.map(pkg => 
        pkg.name === packageName ? { ...pkg, version: '最新版本' } : pkg
      ));
      
      setStatusMessage(`成功更新全局包 ${packageName}`);
    } catch (err: any) {
      setError(`更新全局包出错: ${err.message}`);
      console.error("更新全局包异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 过滤包列表
  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pkg.description && pkg.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 初始加载
  useEffect(() => {
    fetchGlobalPackages();
  }, [packageManager]);

  return (
    <div className={styles.globalPackagesManager}>
      <div className={styles.sectionHeader}>
        <h2>全局包管理</h2>
        <div className={styles.actionButtons}>
          <div className={styles.packageManagerSelector}>
            <button 
              className={`${styles.tabButton} ${packageManager === 'npm' ? styles.tabButtonActive : ''}`}
              onClick={() => setPackageManager('npm')}
            >
              NPM
            </button>
            <button 
              className={`${styles.tabButton} ${packageManager === 'pnpm' ? styles.tabButtonActive : ''}`}
              onClick={() => setPackageManager('pnpm')}
            >
              PNPM
            </button>
            <button 
              className={`${styles.tabButton} ${packageManager === 'yarn' ? styles.tabButtonActive : ''}`}
              onClick={() => setPackageManager('yarn')}
            >
              Yarn
            </button>
          </div>
          <button 
            className={styles.refreshButton} 
            onClick={fetchGlobalPackages} 
            disabled={loading}
          >
            刷新
          </button>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {statusMessage && <div className={styles.statusMessage}>{statusMessage}</div>}

      <div className={styles.installPackageForm}>
        <h3>安装全局包</h3>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="包名称"
            value={packageToInstall}
            onChange={(e) => setPackageToInstall(e.target.value)}
            disabled={loading}
            className={styles.inputField}
          />
          <input
            type="text"
            placeholder="版本 (可选)"
            value={packageVersion}
            onChange={(e) => setPackageVersion(e.target.value)}
            disabled={loading}
            className={styles.inputField}
          />
          <button
            onClick={installGlobalPackage}
            disabled={loading || !packageToInstall.trim()}
            className={styles.addButton}
          >
            安装
          </button>
        </div>
      </div>

      <div className={styles.packageList}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="搜索全局包..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <h3>已安装的全局包</h3>
        {loading && packages.length === 0 ? (
          <div className={styles.loading}>加载中...</div>
        ) : (
          <>
            {filteredPackages.length === 0 ? (
              <div className={styles.emptyMessage}>
                {searchTerm ? '没有找到匹配的全局包' : '没有找到已安装的全局包'}
              </div>
            ) : (
              <div className={styles.packageItems}>
                {filteredPackages.map((pkg) => (
                  <div key={pkg.name} className={styles.packageItem}>
                    <div className={styles.packageInfo}>
                      <div className={styles.packageName}>{pkg.name}</div>
                      <div className={styles.packageVersion}>{pkg.version}</div>
                      {pkg.description && (
                        <div className={styles.packageDescription}>{pkg.description}</div>
                      )}
                    </div>
                    <div className={styles.packageActions}>
                      <button 
                        onClick={() => updateGlobalPackage(pkg.name)}
                        disabled={loading}
                        className={styles.useButton}
                      >
                        更新
                      </button>
                      <button 
                        onClick={() => uninstallGlobalPackage(pkg.name)}
                        disabled={loading}
                        className={styles.deleteButton}
                      >
                        卸载
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 