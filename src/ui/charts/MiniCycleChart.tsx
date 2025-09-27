import React, { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import type { Cycle } from '../../domain/types';
import { buildCycleMetricSeries } from '../../domain/chartTransforms';
import { PlotlyChart } from './PlotlyChart';

export interface MiniCycleChartProps {
  cycle: Cycle;
  height?: number;
  maxPoints?: number;
  showCurrent?: boolean;
  showCharge?: boolean;
  onClick?: () => void;
}

const DEFAULT_HEIGHT = 80;
const DEFAULT_MAX_POINTS = 400;

export const MiniCycleChart: React.FC<MiniCycleChartProps> = ({
  cycle,
  height = DEFAULT_HEIGHT,
  maxPoints = DEFAULT_MAX_POINTS,
  showCurrent = false,
  showCharge = true,
  onClick,
}) => {
  const series = useMemo(
    () => buildCycleMetricSeries(cycle, { downsample: { maxPoints } }),
    [cycle, maxPoints],
  );

  const voltageSeries = series.metrics.voltage;
  const currentSeries = series.metrics.current;
  const chargeSeries = series.metrics.charge;

  const showCurrentTrace = showCurrent && currentSeries.hasData;
  const showChargeTrace = showCharge && chargeSeries.hasData;
  const voltageColor = '#1f77b4';
  const currentColor = '#ff7f0e';
  const chargeColor = '#d62728';

  const voltageTrace = useMemo<Data>(() => ({
    type: 'scatter',
    mode: 'lines',
    name: 'Напряжение',
    x: voltageSeries.x,
    y: voltageSeries.y,
  line: { color: voltageColor, width: 2.2 },
    hovertemplate: 't=%{x:.2f}s<br>U=%{y:.3f}В<extra></extra>',
  }), [voltageSeries]);

  const currentTrace = useMemo<Data | null>(() => {
    if (!showCurrentTrace) return null;
    return {
      type: 'scatter',
      mode: 'lines',
      name: 'Ток',
      x: currentSeries.x,
      y: currentSeries.y,
      yaxis: 'y2',
  line: { color: currentColor, width: 1.6, dash: 'dot' },
      hovertemplate: 't=%{x:.2f}s<br>I=%{y:.3f}A<extra></extra>',
    } satisfies Data;
  }, [currentSeries, showCurrentTrace]);

  const chargeTrace = useMemo<Data | null>(() => {
    if (!showChargeTrace) return null;
    const axisName = showCurrentTrace ? 'y3' : 'y2';
    return {
      type: 'scatter',
      mode: 'lines',
      name: 'Заряд',
      x: chargeSeries.x,
      y: chargeSeries.y,
      yaxis: axisName,
  line: { color: chargeColor, width: 2.4, dash: 'dash' },
      hovertemplate: 't=%{x:.2f}s<br>Q=%{y:.3f}Кл<extra></extra>',
    } satisfies Data;
  }, [chargeSeries, showChargeTrace, showCurrentTrace]);

  const data = useMemo(() => {
    const traces: Data[] = [voltageTrace];
    if (currentTrace) traces.push(currentTrace);
    if (chargeTrace) traces.push(chargeTrace);
    return traces;
  }, [voltageTrace, currentTrace, chargeTrace]);

  const layout = useMemo<Partial<Layout>>(() => ({
    height,
    margin: { l: 10, r: 10, t: 6, b: 12, pad: 0 },
    xaxis: { visible: false, showgrid: false, zeroline: false },
    yaxis: { visible: false, showgrid: false, zeroline: false },
    yaxis2: currentTrace || chargeTrace
      ? {
          overlaying: 'y',
          side: 'right',
          visible: false,
        }
      : undefined,
    yaxis3: currentTrace && chargeTrace
      ? {
          overlaying: 'y',
          side: 'right',
          visible: false,
        }
      : undefined,
    showlegend: false,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
  }), [height, currentTrace, chargeTrace]);

  if (!series.points.length) {
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
        minHeight: height,
      }}
    >
      <PlotlyChart
        data={data}
        layout={layout}
        config={{ displayModeBar: false, staticPlot: false }}
        style={{ height }}
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
