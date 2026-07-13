// Scientific values and chart semantics live here, separate from SVG rendering.
// Values are transcribed from the paper's experiment logs.

export const EFFICIENCY_PERCENTAGES = Object.freeze([100, 90, 80, 70, 60, 50, 40, 30]);
export const EFFICIENCY_READOUT_PERCENTAGES = EFFICIENCY_PERCENTAGES;

export const LINE_CHARTS = Object.freeze([
  {
    selector: "#loo-chart",
    config: {
      padding: { left: 96, right: 24, top: 60, bottom: 64 },
      yMin: 20,
      yMax: 190,
      yTicks: [60, 100, 140, 180],
      yLabel: "MPJPE (mm)",
      yLabelX: 26,
      xLabel: "held-out action",
      xLabelBottom: 4,
      xTickY: 342,
      legendY: 26,
      legendStep: 236,
      xTicks: [
        { index: 0, label: "A01" },
        { index: 8, label: "A09" },
        { index: 16, label: "A17" },
        { index: 26, label: "A27" },
      ],
      highlight: { index: 16, label: "LEFT WAVE" },
      gapSeriesIndex: 1,
      gapFromSeriesIndex: 0,
      series: [
        {
          key: "included",
          label: "all included",
          values: [41.26, 32.70, 39.01, 43.64, 41.91, 33.36, 37.41, 42.83, 48.25, 43.34, 37.68, 51.73, 33.03, 37.26, 42.64, 42.11, 41.11, 55.92, 56.47, 46.18, 46.49, 45.54, 45.18, 46.15, 48.67, 41.01, 37.26],
        },
        {
          key: "heldout",
          label: "leave one out",
          values: [112.84, 92.74, 113.37, 115.40, 110.22, 92.38, 85.82, 84.00, 156.57, 167.67, 90.60, 150.46, 106.64, 110.71, 100.69, 98.62, 151.12, 148.48, 167.60, 125.30, 126.06, 101.62, 109.96, 103.43, 108.31, 107.90, 84.61],
        },
      ],
    },
  },
  {
    selector: "#efficiency-chart",
    config: {
      padding: { left: 96, right: 24, top: 54, bottom: 64 },
      yMin: 0,
      yMax: 90,
      yTicks: [0, 20, 40, 60, 80],
      showLegend: false,
      yLabel: "MPJPE (mm)",
      yLabelX: 26,
      xLabel: "training data kept",
      xLabelBottom: 4,
      xTickY: 342,
      xTicks: [0, 2, 4, 6, 7].map((index) => ({ index, label: `${EFFICIENCY_PERCENTAGES[index]}%` })),
      referenceLine: { value: 68.2, label: "≈68 mm plateau from 100% to 30%" },
      series: [
        { key: "primary", label: "mmBody", values: [67.22, 68.94, 68.55, 66.40, 67.82, 69.53, 68.68, 68.55] },
      ],
    },
  },
  {
    selector: "#scaling-chart",
    config: {
      padding: { left: 96, right: 24, top: 54, bottom: 64 },
      yMin: 148,
      yMax: 184,
      yTicks: [150, 165, 180],
      yLabel: "OOD MPJPE (mm)",
      yLabelX: 26,
      xLabel: "training samples (log scale)",
      xLabelBottom: 4,
      xTickY: 342,
      xValues: [2, 4, 8, 16, 24, 32, 40],
      xScale: "log",
      xTicks: [
        { index: 0, label: "2k" },
        { index: 2, label: "8k" },
        { index: 4, label: "24k" },
        { index: 6, label: "40k" },
      ],
      showLegend: false,
      pointRadius: 5,
      series: [
        {
          key: "wicompass",
          label: "WiCompass",
          values: [155.73, 153.93, 152.28, 151.29, 150.64, 150.86, 150.16],
          connectPoints: false,
          marker: "circle",
          fit: {
            model: "power",
            coefficient: 169.57,
            exponent: -0.0116,
            xMultiplier: 1000,
            label: "WiCompass  E(D)=169.57 D^-0.0116",
            labelRatio: 0.46,
            labelDy: -16,
          },
        },
        {
          key: "baseline",
          label: "mmBody trace",
          values: [180.66, 180.59, 181.14, 181.46, 178.37, 180.92, 180.82],
          connectPoints: false,
          marker: "square",
          fit: {
            model: "power",
            coefficient: 181.86,
            exponent: -0.0008,
            xMultiplier: 1000,
            label: "mmBody trace  E(D)=181.86 D^-0.0008",
            labelRatio: 0.42,
            labelDy: -16,
          },
        },
      ],
    },
  },
]);

export const BAR_CHARTS = Object.freeze([
  {
    selector: "#realworld-chart",
    config: {
      padding: { left: 90, right: 18, top: 72, bottom: 64 },
      yMin: 0,
      yMax: 130,
      yTicks: [0, 30, 60, 90, 120],
      yLabelX: 24,
      legendY: 50,
      legendStep: 215,
      barLabelY: 348,
      barWidth: 60,
      groups: [
        { label: "Recollection oracle", values: [49.6, 95.7] },
        { label: "WiCompass", values: [48.3, 105.7] },
        { label: "Baseline", values: [43.4, 112.9] },
      ],
    },
  },
]);
