declare global {
  interface Window {
    electronAPI: {
      installCrawlee: () => Promise<{ success: boolean; error?: string }>;
    };
  }
}

import React, { useState } from 'react';

const InstallPackage = () => {
  const [status, setStatus] = useState('');

  const handleInstall = async () => {
    setStatus('Installing...');
    const result = await window.electronAPI.installCrawlee();
    setStatus(
      result.success ? '✅ Crawlee installed' : `❌ Failed: ${result.error}`,
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Install Crawlee</h2>
      <button onClick={handleInstall}>Install Crawlee</button>
      <p>Status: {status}</p>
    </div>
  );
};

export default InstallPackage;
