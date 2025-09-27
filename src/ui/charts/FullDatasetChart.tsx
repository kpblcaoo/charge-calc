import React, { useEffect, useMemo, useState } from 'react';
import type { Data, Layout } from 'plotly.js';
import type { Cycle } from '../../domain/types';
import { buildAllCyclesMetricSeries } from '../../domain/chartTransforms';
import { PlotlyChart } from './PlotlyChart';

export interface FullDatasetChartProps {
  cycles: Cycle[];
  maxPointsPerCycle?: number;
  initialShowCurrent?: boolean;
  initialShowCharge?: boolean;
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
  initialShowCharge = true,
  height = DEFAULT_HEIGHT,
  highlightCycle = null,
  showControls = true,
}) => {
  const [visibleCycleIds, setVisibleCycleIds] = useState<number[]>(() =>
    cycles.map((cycle) => cycle.cycle),
  );
  const [showCurrent, setShowCurrent] = useState(initialShowCurrent);
  const [showCharge, setShowCharge] = useState(initialShowCharge);

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
    return buildAllCyclesMetricSeries(cycles, { downsample: { maxPoints: maxPointsPerCycle } });
  }, [cycles, maxPointsPerCycle]);

  const data = useMemo(() => {
    const traces: Data[] = [];
    const visibleSet = new Set(visibleCycleIds);

    series.forEach(({ cycle, metrics }, idx) => {
      if (!visibleSet.has(cycle)) return;
      const baseColor = palette[idx % palette.length];
      const isHighlighted = highlightCycle != null && cycle === highlightCycle;
      const alpha = isHighlighted ? 1 : 0.85;

      const color = rgba(baseColor, alpha);
      const voltageSeries = metrics.voltage;
      const currentSeries = metrics.current;
      const chargeSeries = metrics.charge;

      traces.push({
        type: 'scatter',
        mode: 'lines',
        name: `Цикл ${cycle} · U`,
        legendgroup: `cycle-${cycle}`,
        x: voltageSeries.x,
        y: voltageSeries.y,
        line: { color, width: isHighlighted ? 3 : 2 },
        hovertemplate: 'Цикл %{text}<br>t=%{x:.2f}s<br>U=%{y:.3f}В<extra></extra>',
        text: Array(voltageSeries.x.length).fill(cycle),
      } satisfies Data);

      const shouldShowCurrent = showCurrent && currentSeries.hasData;
      const shouldShowCharge = showCharge && chargeSeries.hasData;
      const chargeAxisName = shouldShowCurrent ? 'y3' : 'y2';

      if (shouldShowCurrent) {
        traces.push({
          type: 'scatter',
          mode: 'lines',
          name: `Цикл ${cycle} · I`,
          legendgroup: `cycle-${cycle}-current`,
          x: currentSeries.x,
          y: currentSeries.y,
          yaxis: 'y2',
          line: { color, width: isHighlighted ? 2 : 1.5, dash: 'dot' },
          hovertemplate: 'Цикл %{text}<br>t=%{x:.2f}s<br>I=%{y:.3f}A<extra></extra>',
          text: Array(currentSeries.x.length).fill(cycle),
        } satisfies Data);
      }

      if (shouldShowCharge) {
        traces.push({
          type: 'scatter',
          mode: 'lines',
          name: `Цикл ${cycle} · Q`,
          legendgroup: `cycle-${cycle}-charge`,
          x: chargeSeries.x,
          y: chargeSeries.y,
          yaxis: chargeAxisName,
          line: { color, width: isHighlighted ? 2.6 : 1.8, dash: 'solid' },
          hovertemplate: 'Цикл %{text}<br>t=%{x:.2f}s<br>Q=%{y:.3f}Кл<extra></extra>',
          text: Array(chargeSeries.x.length).fill(cycle),
        } satisfies Data);
      }
    });

    return traces;
  }, [series, visibleCycleIds, showCurrent, showCharge, highlightCycle]);

  const layout = useMemo<Partial<Layout>>(() => {
    const rightMargin = 32 + (showCurrent ? 36 : 0) + (showCharge ? 40 : 0);
    const baseLayout: Partial<Layout> = {
      height,
      margin: { l: 64, r: rightMargin, t: 36, b: 56 },
      hovermode: 'x unified',
      legend: { orientation: 'h', y: -0.22 },
      xaxis: {
        title: 'Время, с',
        showspikes: true,
        spikethickness: 1,
        spikedash: 'dot',
        spikecolor: 'rgba(80,80,80,0.4)',
      },
      yaxis: {
        title: 'Напряжение, В',
        tickfont: { size: 12 },
        titlefont: { size: 13 },
      },
      paper_bgcolor: 'white',
      plot_bgcolor: 'white',
    };

    if (showCurrent) {
      baseLayout.yaxis2 = {
        title: 'Ток, А',
        overlaying: 'y',
        side: 'right',
        position: showCharge ? 0.94 : 1,
        zeroline: false,
        showgrid: false,
        tickfont: { size: 11 },
        titlefont: { size: 12 },
      };
    }

    if (showCharge) {
      const chargeAxis: Partial<Layout['yaxis']> = {
        title: 'Заряд, Кл',
        overlaying: 'y',
        side: 'right',
        position: 1,
        zeroline: false,
        showgrid: false,
        tickfont: { size: 11 },
        titlefont: { size: 12 },
      };

      if (showCurrent) {
        baseLayout.yaxis3 = chargeAxis;
      } else {
        baseLayout.yaxis2 = chargeAxis;
      }
    }

    return baseLayout;
  }, [height, showCurrent, showCharge]);

  const chartRevision = useMemo(() => {
    const hash = visibleCycleIds.reduce((acc, id) => acc * 31 + id, 7);
    return hash + (showCurrent ? 1000 : 0) + (showCharge ? 2000 : 0);
  }, [visibleCycleIds, showCurrent, showCharge]);

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
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={showCharge}
              onChange={(event) => setShowCharge(event.target.checked)}
            />
            <span>Показывать заряд</span>
          </label>
        </div>
      )}
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
        <PlotlyChart
          data={data}
          layout={layout}
          config={{ displaylogo: false, modeBarButtonsToRemove: ['autoScale2d'], responsive: true }}
          revision={chartRevision}
          style={{ height }}
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
