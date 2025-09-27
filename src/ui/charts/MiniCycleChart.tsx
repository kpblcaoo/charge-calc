import React, { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import type { Cycle } from '../../domain/types';
import { flattenCyclePoints } from '../../domain/chartTransforms';
import { PlotlyChart } from './PlotlyChart';

export interface MiniCycleChartProps {
  cycle: Cycle;
  height?: number;
  maxPoints?: number;
  showCurrent?: boolean;
  onClick?: () => void;
}

const DEFAULT_HEIGHT = 80;
const DEFAULT_MAX_POINTS = 400;

export const MiniCycleChart: React.FC<MiniCycleChartProps> = ({
  cycle,
  height = DEFAULT_HEIGHT,
  maxPoints = DEFAULT_MAX_POINTS,
  showCurrent = false,
  onClick,
}) => {
  const points = useMemo(
    () => flattenCyclePoints(cycle, { downsample: { maxPoints } }),
    [cycle, maxPoints],
  );

  const voltageTrace = useMemo<Data>(() => ({
    type: 'scatter',
    mode: 'lines',
    name: 'Напряжение',
    x: points.map((p) => p.time),
    y: points.map((p) => p.voltage),
    line: { color: '#1f77b4', width: 2 },
    hovertemplate: 't=%{x:.2f}s<br>U=%{y:.3f}В<extra></extra>',
  }), [points]);

  const currentTrace = useMemo<Data | null>(() => {
    if (!showCurrent) return null;
    return {
      type: 'scatter',
      mode: 'lines',
      name: 'Ток',
      x: points.map((p) => p.time),
      y: points.map((p) => p.current),
      yaxis: 'y2',
      line: { color: '#ff7f0e', width: 1.5, dash: 'dot' },
      hovertemplate: 't=%{x:.2f}s<br>I=%{y:.3f}A<extra></extra>',
    } satisfies Data;
  }, [points, showCurrent]);

  const data = useMemo(() => {
    return currentTrace ? [voltageTrace, currentTrace] : [voltageTrace];
  }, [voltageTrace, currentTrace]);

  const layout = useMemo<Partial<Layout>>(() => ({
    height,
    margin: { l: 10, r: 10, t: 6, b: 12, pad: 0 },
    xaxis: { visible: false, showgrid: false, zeroline: false },
    yaxis: { visible: false, showgrid: false, zeroline: false },
    yaxis2: currentTrace
      ? {
          overlaying: 'y',
          side: 'right',
          visible: false,
        }
      : undefined,
    showlegend: false,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
  }), [height, currentTrace]);

  if (!points.length) {
    return <div style={placeholderStyle}>Нет точек</div>;
  }

  const interactiveProps = onClick
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        },
      }
    : {};

  return (
    <div
      {...interactiveProps}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(240,244,248,0.8) 100%)',
      }}
    >
      <PlotlyChart
        data={data}
        layout={layout}
        config={{ displayModeBar: false, staticPlot: false }}
      />
    </div>
  );
};

const placeholderStyle: React.CSSProperties = {
  height: DEFAULT_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
  border: '1px dashed rgba(0,0,0,0.1)',
  color: 'rgba(0,0,0,0.4)',
  fontSize: 12,
};
