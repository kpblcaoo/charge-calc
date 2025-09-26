import React from 'react';
import { ParsedResult } from '../domain/types';
import { calculateCharge } from '../domain/calculateCharge';

// Таблица: для каждого цикла одна «шапка» + строки этапов + итог цикла.
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
              <tr style={{ background: '#f6f6f6' }}>
                <td style={{ ...td, fontWeight: 'bold' }}>{c.cycle}</td>
                <td style={{ ...td, fontStyle: 'italic' }}>этап</td>
                <td style={{ ...td, fontStyle: 'italic' }}>заряд</td>
              </tr>
              {c.steps.map(s => (
                <tr key={c.cycle + '-' + s.step}>
                  <td style={td}></td>
                  <td style={td}>{s.step}</td>
                  <td style={td}>{calculateCharge(s.dp).toFixed(6)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }} colSpan={2}>Итого</td>
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
