import React, { useState } from 'react';
import { FileDropZone } from './FileDropZone';
import { ResultsTable } from './ResultsTable';
import { parseFileInWorker } from '../worker/workerClient';
import { ParsedResult } from '../domain/types';

export const App: React.FC = () => {
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFiles(files: FileList) {
    const file = files[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const r = await parseFileInWorker(file);
      setResult(r);
    } catch (e:any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Charge Calculator (Web)</h1>
      <FileDropZone onFiles={handleFiles} />
      {loading && <p>Parsing...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && <ResultsTable data={result} />}
    </div>
  );
};
