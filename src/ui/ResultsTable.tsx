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
        {(() => {
          // Объединяем возможные дублирующиеся циклы (если файл содержит 'cy N' перед каждым этапом)
          const order: number[] = [];
            const map = new Map<number, typeof data.cycles[0]['steps']>();
            for (const c of data.cycles) {
              if (!map.has(c.cycle)) { order.push(c.cycle); map.set(c.cycle, []);} 
              map.get(c.cycle)!.push(...c.steps);
            }
            return order.map(cycleNum => {
              const steps = map.get(cycleNum)!;
              const total = steps.reduce((acc, s) => acc + calculateCharge(s.dp), 0);
              return (
                <React.Fragment key={cycleNum}>
                  {steps.map((s, idx) => (
                    <tr key={cycleNum + '-' + s.step + '-' + idx}>
                      <td style={td}>{idx === 0 ? cycleNum : ''}</td>
                      <td style={td}>{s.step}</td>
                      <td style={td}>{calculateCharge(s.dp).toFixed(6)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 'bold' }} colSpan={2}>Итого по циклу {cycleNum}</td>
                    <td style={{ ...td, fontWeight: 'bold' }}>{total.toFixed(6)}</td>
                  </tr>
                </React.Fragment>
              );
            });
        })()}
      </tbody>
    </table>
  );
};

const th: React.CSSProperties = { border: '1px solid #ccc', padding: '4px', background: '#eee', textAlign: 'left' };
const td: React.CSSProperties = { border: '1px solid #ccc', padding: '4px' };
