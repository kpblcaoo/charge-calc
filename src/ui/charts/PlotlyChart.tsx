import React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js';
import type { PlotParams } from 'react-plotly.js';
import type { Config } from 'plotly.js';

const PlotComponent = createPlotlyComponent(Plotly);

export type PlotlyChartProps = PlotParams;

export const PlotlyChart: React.FC<PlotlyChartProps> = ({ config, style, useResizeHandler = true, ...rest }) => {
  const mergedConfig: Partial<Config> = {
    displaylogo: false,
    responsive: true,
    ...config,
  };

  return (
    <PlotComponent
      config={mergedConfig}
      style={{ width: '100%', height: '100%', ...style }}
      useResizeHandler={useResizeHandler}
      {...rest}
    />
  );
};
