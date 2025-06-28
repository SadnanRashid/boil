import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    electronAPI: {
      installCrawlee: () => Promise<{ success: boolean; error?: string }>;
      onInstallProgress: (
        cb: (data: { package: string; progress: number }) => void,
      ) => void;
    };
  }
}

const InstallPackage = () => {
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentPackage, setCurrentPackage] = useState('');

  useEffect(() => {
    window.electronAPI.onInstallProgress(({ package: pkg, progress }) => {
      setProgress(progress);
      setCurrentPackage(pkg);
    });
  }, []);

  const handleInstall = async () => {
    setStatus('Installing...');
    setProgress(0);
    const result = await window.electronAPI.installCrawlee();
    setStatus(
      result.success
        ? '✅ All packages installed'
        : `❌ Failed: ${result.error}`,
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Install Crawlee, Cheerio, Puppeteer</h2>
      <button onClick={handleInstall}>Install Packages</button>
      <p>Status: {status}</p>

      {progress > 0 && (
        <div style={{ marginTop: 10 }}>
          <p>
            Installing: <strong>{currentPackage}</strong>
          </p>
          <div
            style={{
              background: '#eee',
              width: '100%',
              height: '10px',
              borderRadius: '5px',
            }}
          >
            <div
              style={{
                background: '#4caf50',
                width: `${progress}%`,
                height: '100%',
                borderRadius: '5px',
                transition: 'width 0.3s',
              }}
            ></div>
          </div>
          <p>{progress}%</p>
        </div>
      )}
    </div>
  );
};

export default InstallPackage;
