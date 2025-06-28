import React, { useState } from 'react';
import { ipcRenderer } from 'electron';

const InstallPackage = () => {
  const [status, setStatus] = useState('');

  const handleInstall = async () => {
    setStatus('Installing...');
    const result = await ipcRenderer.invoke('install-crawlee');
    setStatus(
      result.success ? '✅ Crawlee installed' : `❌ Failed: ${result.error}`,
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Install Crawlee Package</h2>
      <button onClick={handleInstall}>Install Crawlee</button>
      <p>Status: {status}</p>
    </div>
  );
};

export default InstallPackage;
