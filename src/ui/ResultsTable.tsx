import React, { useMemo } from 'react';
import type { Cycle, ParsedResult } from '../domain/types';
import { calculateCharge } from '../domain/calculateCharge';
import { normalizeCycles } from '../domain/cycleUtils';
import { MiniCycleChart } from './charts/MiniCycleChart';

interface ResultsTableProps {
  data: ParsedResult;
  onCycleSelect?: (cycle: Cycle) => void;
}

interface CycleSummary {
  cycle: Cycle;
  totalCharge: number;
  totalSteps: number;
  totalPoints: number;
}

// Представление результатов: карточки циклов с мини-графиком и таблицей этапов.
export const ResultsTable: React.FC<ResultsTableProps> = ({ data, onCycleSelect }) => {
  const cycles = useMemo(() => normalizeCycles(data), [data]);

  const summaries = useMemo<CycleSummary[]>(
    () =>
      cycles.map((cycle) => ({
        cycle,
        totalCharge: cycle.steps.reduce((acc, step) => acc + calculateCharge(step.dp), 0),
        totalSteps: cycle.steps.length,
        totalPoints: cycle.steps.reduce((acc, step) => acc + step.dp.length, 0),
      })),
    [cycles],
  );

  if (!summaries.length) {
    return <p>Нет данных для отображения.</p>;
  }

  return (
    <div style={containerStyle}>
      {summaries.map(({ cycle, totalCharge, totalSteps, totalPoints }) => (
        <section key={cycle.cycle} style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={cardInfoStyle}>
              <h2 style={cycleTitleStyle}>Цикл {cycle.cycle}</h2>
              <div style={statsRowStyle}>
                <Stat label="Этапов" value={totalSteps} />
                <Stat label="Точек" value={totalPoints} />
                <Stat label="Σ заряд" value={totalCharge.toFixed(6)} units="Кл" />
              </div>
            </div>
            <div style={chartWrapperStyle}>
              <MiniCycleChart
                cycle={cycle}
                onClick={onCycleSelect ? () => onCycleSelect(cycle) : undefined}
              />
              {onCycleSelect && <span style={chartHintStyle}>Нажмите, чтобы открыть подробный график</span>}
            </div>
          </div>
          <table style={stepsTableStyle}>
            <thead>
              <tr>
                <th style={thStep}>Этап</th>
                <th style={thStep}>Точек</th>
                <th style={thStep}>Заряд, Кл</th>
              </tr>
            </thead>
            <tbody>
              {cycle.steps.map((step) => {
                const charge = calculateCharge(step.dp);
                return (
                  <tr key={`${cycle.cycle}-${step.step}`}>
                    <td style={tdStep}>#{step.step}</td>
                    <td style={tdStep}>{step.dp.length}</td>
                    <td style={tdStep}>{charge.toFixed(6)}</td>
                  </tr>
                );
              })}
              <tr>
                <td style={{ ...tdStep, fontWeight: 600 }} colSpan={2}>
                  Итого
                </td>
                <td style={{ ...tdStep, fontWeight: 600 }}>{totalCharge.toFixed(6)}</td>
              </tr>
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(244,248,252,0.92) 100%)',
  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
  padding: '1.25rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  gap: '1.5rem',
  alignItems: 'stretch',
  flexWrap: 'wrap',
};

const cardInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  minWidth: 220,
  flex: 1,
};

const cycleTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#0f172a',
};

const statsRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

const chartWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  maxWidth: 'min(360px, 100%)',
  flex: 1,
};

const chartHintStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'rgba(15, 23, 42, 0.6)',
  textAlign: 'right',
};

const stepsTableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 14,
};

const thStep: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.5rem',
  background: 'rgba(15, 23, 42, 0.05)',
  borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
};

const tdStep: React.CSSProperties = {
  padding: '0.5rem',
  borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'rgba(15, 23, 42, 0.65)',
};

const statValueStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: '#0f172a',
};

const statContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.15rem',
  padding: '0.5rem 0.75rem',
  borderRadius: 12,
  background: 'rgba(15, 23, 42, 0.04)',
};

const unitsStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'rgba(15, 23, 42, 0.45)',
};

const Stat: React.FC<{ label: string; value: string | number; units?: string }> = ({ label, value, units }) => (
  <span style={statContainerStyle}>
    <span style={statValueStyle}>{value}</span>
    <span style={statLabelStyle}>
      {label}
      {units ? <span style={unitsStyle}> · {units}</span> : null}
    </span>
  </span>
);
