import React from 'react';
import { ParsedResult } from '../domain/types';
import { calculateCharge } from '../domain/calculateCharge';

// Русифицированная таблица результатов: одна строка на шаг + итог по циклу одной строкой.
export const ResultsTable: React.FC<{ data: ParsedResult }> = ({ data }) => {
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={th}>Цикл</th>
          <th style={th}>Этап</th>
          <th style={th}>Заряд</th>
        </tr>
      </thead>
      <tbody>
        {data.cycles.map(c => {
          const cycleTotal = c.steps.reduce((acc, s) => acc + calculateCharge(s.dp), 0);
          return (
            <React.Fragment key={c.cycle}>
              {c.steps.map(s => (
                <tr key={c.cycle + '-' + s.step}>
                  <td style={td}>{c.cycle}</td>
                  <td style={td}>{s.step}</td>
                  <td style={td}>{calculateCharge(s.dp).toFixed(6)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }} colSpan={2}>Итого по циклу {c.cycle}</td>
                <td style={{ ...td, fontWeight: 'bold' }}>{cycleTotal.toFixed(6)}</td>
              </tr>
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

const th: React.CSSProperties = { border: '1px solid #ccc', padding: '4px', background: '#eee', textAlign: 'left' };
const td: React.CSSProperties = { border: '1px solid #ccc', padding: '4px' };
