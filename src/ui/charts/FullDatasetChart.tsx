import React, { useEffect, useMemo, useState } from 'react';
import type { Data, Layout } from 'plotly.js';
import type { Cycle } from '../../domain/types';
import { flattenCyclePoints } from '../../domain/chartTransforms';
import { PlotlyChart } from './PlotlyChart';

export interface FullDatasetChartProps {
  cycles: Cycle[];
  maxPointsPerCycle?: number;
  initialShowCurrent?: boolean;
  height?: number;
  highlightCycle?: number | null;
  showControls?: boolean;
}

const palette = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];

const DEFAULT_MAX_POINTS = 3000;
const DEFAULT_HEIGHT = 420;

export const FullDatasetChart: React.FC<FullDatasetChartProps> = ({
  cycles,
  maxPointsPerCycle = DEFAULT_MAX_POINTS,
  initialShowCurrent = false,
  height = DEFAULT_HEIGHT,
  highlightCycle = null,
  showControls = true,
}) => {
  const [visibleCycleIds, setVisibleCycleIds] = useState<number[]>(() =>
    cycles.map((cycle) => cycle.cycle),
  );
  const [showCurrent, setShowCurrent] = useState(initialShowCurrent);

  // Sync with new cycles
  useEffect(() => {
    setVisibleCycleIds((prev) => {
      if (!prev.length) {
        return cycles.map((cycle) => cycle.cycle);
      }
      const cycleNumbers = cycles.map((cycle) => cycle.cycle);
      return prev.filter((id) => cycleNumbers.includes(id));
    });
  }, [cycles]);

  const series = useMemo(() => {
    return cycles.map((cycle) => ({
      cycle: cycle.cycle,
      points: flattenCyclePoints(cycle, { downsample: { maxPoints: maxPointsPerCycle } }),
    }));
  }, [cycles, maxPointsPerCycle]);

  const data = useMemo(() => {
    const traces: Data[] = [];
    const visibleSet = new Set(visibleCycleIds);

    series.forEach(({ cycle, points }, idx) => {
      if (!visibleSet.has(cycle)) return;
      const baseColor = palette[idx % palette.length];
      const isHighlighted = highlightCycle != null && cycle === highlightCycle;
      const alpha = isHighlighted ? 1 : 0.85;

      const color = rgba(baseColor, alpha);
      traces.push({
        type: 'scatter',
        mode: 'lines',
        name: `Цикл ${cycle} · U`,
        x: points.map((p) => p.time),
        y: points.map((p) => p.voltage),
        line: { color, width: isHighlighted ? 3 : 2 },
        hovertemplate: 'Цикл %{text}<br>t=%{x:.2f}s<br>U=%{y:.3f}В<extra></extra>',
        text: Array(points.length).fill(cycle),
      } satisfies Data);

      if (showCurrent) {
        traces.push({
          type: 'scatter',
          mode: 'lines',
          name: `Цикл ${cycle} · I`,
          x: points.map((p) => p.time),
          y: points.map((p) => p.current),
          yaxis: 'y2',
          line: { color, width: isHighlighted ? 2 : 1.5, dash: 'dot' },
          hovertemplate: 'Цикл %{text}<br>t=%{x:.2f}s<br>I=%{y:.3f}A<extra></extra>',
          text: Array(points.length).fill(cycle),
        } satisfies Data);
      }
    });

    return traces;
  }, [series, visibleCycleIds, showCurrent, highlightCycle]);

  const layout = useMemo<Partial<Layout>>(() => ({
    height,
    margin: { l: 64, r: showCurrent ? 72 : 32, t: 32, b: 48 },
    hovermode: 'x unified',
    legend: { orientation: 'h', y: -0.2 },
    xaxis: {
      title: 'Время, с',
      showspikes: true,
      spikethickness: 1,
      spikedash: 'dot',
      spikecolor: 'rgba(80,80,80,0.4)',
    },
    yaxis: {
      title: 'Напряжение, В',
    },
    yaxis2: showCurrent
      ? {
          title: 'Ток, А',
          overlaying: 'y',
          side: 'right',
          zeroline: false,
          showgrid: false,
        }
      : undefined,
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
  }), [height, showCurrent]);

  const handleToggleCycle = (cycleId: number) => {
    setVisibleCycleIds((prev) => {
      if (prev.includes(cycleId)) {
        return prev.filter((id) => id !== cycleId);
      }
      return [...prev, cycleId].sort((a, b) => a - b);
    });
  };

  const handleSelectAll = () => setVisibleCycleIds(cycles.map((cycle) => cycle.cycle));
  const handleClearAll = () => setVisibleCycleIds([]);

  return (
    <div style={containerStyle}>
      {showControls && (
        <div style={controlsStyle}>
          <div style={controlRowStyle}>
            <span style={controlLabelStyle}>Циклы:</span>
            <div style={chipsContainerStyle}>
              {cycles.map((cycle, idx) => {
                const color = palette[idx % palette.length];
                const isActive = visibleCycleIds.includes(cycle.cycle);
                return (
                  <button
                    key={cycle.cycle}
                    type="button"
                    onClick={() => handleToggleCycle(cycle.cycle)}
                    style={{
                      ...chipStyle,
                      background: isActive ? rgba(color, 0.16) : 'transparent',
                      borderColor: rgba(color, isActive ? 0.5 : 0.25),
                      color: '#1a1a1a',
                    }}
                  >
                    Цикл {cycle.cycle}
                  </button>
                );
              })}
            </div>
            <div style={buttonGroupStyle}>
              <button type="button" onClick={handleSelectAll} style={secondaryButtonStyle}>
                Все
              </button>
              <button type="button" onClick={handleClearAll} style={secondaryButtonStyle}>
                Снять
              </button>
            </div>
          </div>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={showCurrent}
              onChange={(event) => setShowCurrent(event.target.checked)}
            />
            <span>Показывать ток</span>
          </label>
        </div>
      )}
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
        <PlotlyChart
          data={data}
          layout={layout}
          config={{ displaylogo: false, modeBarButtonsToRemove: ['autoScale2d'], responsive: true }}
        />
      </div>
    </div>
  );
};

function rgba(hex: string, alpha: number): string {
  if (!hex.startsWith('#')) return hex;
  const stripped = hex.slice(1);
  const bigint = parseInt(stripped, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  padding: '1rem 0',
};

const controlsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
  borderRadius: 12,
  border: '1px solid rgba(0,0,0,0.08)',
  background: 'linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(234,240,247,0.9) 100%)',
};

const controlRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.5rem',
};

const controlLabelStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 14,
};

const chipsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  flex: 1,
};

const chipStyle: React.CSSProperties = {
  padding: '0.25rem 0.6rem',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
  fontSize: 12,
  background: 'transparent',
  cursor: 'pointer',
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.4rem',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '0.25rem 0.6rem',
  borderRadius: 6,
  border: '1px solid rgba(0,0,0,0.12)',
  background: 'white',
  cursor: 'pointer',
  fontSize: 12,
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: 13,
  color: '#1a1a1a',
};
