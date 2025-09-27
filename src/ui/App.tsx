import React, { useMemo, useState } from 'react';
import { FileDropZone } from './FileDropZone';
import { ResultsTable } from './ResultsTable';
import { parseFileInWorker } from '../worker/workerClient';
import type { Cycle, ParsedResult } from '../domain/types';
import { exportJson } from '../export/exportJson';
import { exportCsv } from '../export/exportCsv';
import { normalizeCycles } from '../domain/cycleUtils';
import { FullDatasetChart } from './charts/FullDatasetChart';
import { CycleDetailsModal } from './charts/CycleDetailsModal';

export const App: React.FC = () => {
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);

  const normalizedCycles = useMemo(() => (result ? normalizeCycles(result) : []), [result]);

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
      <h1>Расчет заряда</h1>
      {result && !loading && (
        <div style={{ margin: '0 0 0.75rem 0', display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => {
            if (!result) return;
            const blob = exportJson(result);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'result.json'; a.click();
            setTimeout(()=>URL.revokeObjectURL(url), 5000);
          }}>Экспорт JSON</button>
          <button onClick={() => {
            if (!result) return;
            const blob = exportCsv(result);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'result.csv'; a.click();
            setTimeout(()=>URL.revokeObjectURL(url), 5000);
          }}>Экспорт CSV</button>
        </div>
      )}
      <FileDropZone onFiles={handleFiles} />
      {loading && <p>Обработка...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <>
          <ResultsTable data={result} onCycleSelect={setSelectedCycle} />
          <section style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '0.75rem' }}>Полный набор данных</h2>
            <FullDatasetChart
              cycles={normalizedCycles}
              highlightCycle={selectedCycle?.cycle ?? null}
            />
          </section>
        </>
      )}
      {selectedCycle && (
        <CycleDetailsModal cycle={selectedCycle} onClose={() => setSelectedCycle(null)} />
      )}
    </div>
  );
};
