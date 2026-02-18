import * as echarts from 'echarts/core';
import { ParallelChart } from 'echarts/charts';
import { AxisPointerComponent, LegendComponent, ParallelComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';

// PatternFly's ECharts wrapper uses ECharts' modular build.
// Register the series/components needed for parallel coordinates.
echarts.use([
  ParallelChart,
  ParallelComponent,
  TooltipComponent,
  LegendComponent,
  AxisPointerComponent,
  CanvasRenderer,
  SVGRenderer,
]);

export {}; // Ensure this file is treated as a module.
