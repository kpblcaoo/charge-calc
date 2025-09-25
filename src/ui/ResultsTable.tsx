import React from 'react';
import { ParsedResult } from '../domain/types';
import { calculateCharge } from '../domain/calculateCharge';

export const ResultsTable: React.FC<{ data: ParsedResult }> = ({ data }) => {
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={th}>Cycle</th>
          <th style={th}>Step</th>
          <th style={th}>Charge</th>
        </tr>
      </thead>
      <tbody>
        {data.cycles.map(c => (
          <React.Fragment key={c.cycle}>
            {c.steps.map(s => (
              <tr key={c.cycle + '-' + s.step}>
                <td style={td}>{c.cycle}</td>
                <td style={td}>{s.step}</td>
                <td style={td}>{calculateCharge(s.dp).toFixed(6)}</td>
              </tr>
            ))}
            <tr>
              <td></td>
              <td style={{ ...td, fontWeight: 'bold' }}>Total</td>
              <td style={{ ...td, fontWeight: 'bold' }}>{c.steps.reduce((acc, s) => acc + calculateCharge(s.dp), 0).toFixed(6)}</td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

const th: React.CSSProperties = { border: '1px solid #ccc', padding: '4px', background: '#eee', textAlign: 'left' };
const td: React.CSSProperties = { border: '1px solid #ccc', padding: '4px' };
