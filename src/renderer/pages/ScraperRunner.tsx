import React, { useState } from 'react';

const SCRAPERS = ['example', 'amazon', 'youtube']; // extend this list dynamically if needed

const ScraperRunner = () => {
  const [status, setStatus] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState('example');

  const handleRun = async () => {
    setStatus('Running...');
    setResults([]);

    const run = await window.electronAPI.runScraper(selected);
    if (!run.success) {
      setStatus(`❌ Failed: ${run.error}`);
      return;
    }

    setStatus('✅ Scraper finished. Loading results...');

    const data = await window.electronAPI.readDataset();
    if (data.success) {
      setResults(data.data || []);
      setStatus('✅ Results loaded.');
    } else {
      setStatus(`❌ Failed to load data: ${data.error}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Universal Scraper Runner</h2>

      <label>Select Scraper: </label>
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        {SCRAPERS.map((scraper) => (
          <option key={scraper} value={scraper}>
            {scraper}
          </option>
        ))}
      </select>

      <button onClick={handleRun} style={{ marginLeft: 10 }}>
        Run Scraper
      </button>

      <p>Status: {status}</p>

      {results.length > 0 && (
        <table
          border={1}
          cellPadding={10}
          style={{ marginTop: 20, borderCollapse: 'collapse' }}
        >
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Domain</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.title}</td>
                <td>{item.domain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ScraperRunner;
