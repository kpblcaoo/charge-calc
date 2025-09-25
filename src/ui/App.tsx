import React, { useState } from 'react';
import { FileDropZone } from './FileDropZone';
import { ResultsTable } from './ResultsTable';
import { parseFileInWorker } from '../worker/workerClient';
import { ParsedResult } from '../domain/types';
import { exportJson } from '../export/exportJson';
import { exportCsv } from '../export/exportCsv';

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
      {result && !loading && (
        <div style={{ margin: '0 0 0.75rem 0', display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => {
            if (!result) return;
            const blob = exportJson(result);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'result.json'; a.click();
            setTimeout(()=>URL.revokeObjectURL(url), 5000);
          }}>Export JSON</button>
          <button onClick={() => {
            if (!result) return;
            const blob = exportCsv(result);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'result.csv'; a.click();
            setTimeout(()=>URL.revokeObjectURL(url), 5000);
          }}>Export CSV</button>
        </div>
      )}
      <FileDropZone onFiles={handleFiles} />
      {loading && <p>Parsing...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && <ResultsTable data={result} />}
      {result && !loading && (
        <>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => {
              if (!result) return;
              const blob = exportJson(result);
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'result.json'; a.click();
              setTimeout(()=>URL.revokeObjectURL(url), 5000);
            }}>Export JSON</button>
            <button onClick={() => {
              if (!result) return;
              const blob = exportCsv(result);
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'result.csv'; a.click();
              setTimeout(()=>URL.revokeObjectURL(url), 5000);
            }}>Export CSV</button>
          </div>
        </>
      )}
    </div>
  );
};
