// Scientific values and chart semantics live here, separate from SVG rendering.
// Values are transcribed from the paper's experiment logs.

export const EFFICIENCY_PERCENTAGES = Object.freeze([100, 90, 80, 70, 60, 50, 40, 30]);
export const EFFICIENCY_READOUT_PERCENTAGES = EFFICIENCY_PERCENTAGES;

export const ACTION_GENERALIZATION = Object.freeze({
  action: Object.freeze({ id: "A17", label: "Left-hand wave", index: 16 }),
  yMax: 170,
  conditions: Object.freeze([
    Object.freeze({ key: "seen", label: "Seen in training", trainingActions: 27, value: 41.11 }),
    Object.freeze({ key: "heldout", label: "Held out", trainingActions: 26, value: 151.12 }),
  ]),
});

export const LINE_CHARTS = Object.freeze([
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
      xLabel: "Training data kept",
      xLabelBottom: 4,
      xTickY: 342,
      xTicks: [0, 2, 4, 6, 7].map((index) => ({ index, label: `${EFFICIENCY_PERCENTAGES[index]}%` })),
      referenceLine: { value: 68.2, label: "Mean 68.2 mm" },
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
      xLabel: "Training samples (log scale)",
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
      gapAnnotation: {
        xValue: 40,
        fromSeriesKey: "baseline",
        toSeriesKey: "wicompass",
        label: "25–30 mm lower OOD MPJPE",
        labelSide: "left",
      },
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
            labelRatio: 0.06,
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
            labelRatio: 0.06,
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
      padding: { left: 96, right: 24, top: 72, bottom: 64 },
      yMin: 0,
      yMax: 130,
      yTicks: [0, 30, 60, 90, 120],
      yLabelX: 26,
      legendY: 34,
      legendStep: 230,
      legendLabels: ["Training split", "Held-out benchmark"],
      barLabelY: 354,
      barWidth: 76,
      barGap: 16,
      comparison: {
        groupA: 1,
        groupB: 2,
        seriesIndex: 1,
        label: "7.2 mm lower",
      },
      groups: [
        { label: "Recollection oracle", values: [49.6, 95.7] },
        { label: "WiCompass", values: [48.3, 105.7] },
        { label: "Action-list baseline", values: [43.4, 112.9] },
      ],
    },
  },
]);
