import { PanelPlugin, FieldConfigProperty } from '@grafana/data';
import { TimelessPanel, TimelessOptions } from './Timeless';

export const plugin = new PanelPlugin<TimelessOptions>(TimelessPanel)
  .setPanelOptions(builder => {
    return builder
      .addRadio({
        path: 'plotType',
        defaultValue: 'line',
        name: 'Plot Type',
        settings: {
          options: [
            {
              value: 'line',
              label: 'Line',
            },
            {
              value: 'bar',
              label: 'Bar',
            },
            {
              value: 'scatter',
              label: 'Scatter',
            },
            {
              value: 'heatmap',
              label: 'Heatmap',
            },
          ],
        },
      })
      .addRadio({
        path: 'barType',
        defaultValue: 'stack',
        name: 'Series counter size',
        settings: {
          options: [
            {
              value: 'stack',
              label: 'Stack',
            },
            {
              value: 'group',
              label: 'Group',
            },
          ],
        },
        showIf: config => config.plotType === 'bar',
      })
      .addNumberInput({
        path: 'titleSize',
        name: 'Axis Title Size',
        defaultValue: 16,
        settings: {
          step: 1,
          integer: true,
        },
      })
      .addBooleanSwitch({
        path: 'showXAxisTitle',
        name: 'Show X Axis Title',
        defaultValue: false,
      })
      .addBooleanSwitch({
        path: 'showYAxisTitle',
        name: 'Show Y Axis Title',
        defaultValue: false,
      })
      .addBooleanSwitch({
        path: 'showLegend',
        name: 'Show graph legend',
        defaultValue: false,
      })
      .addNumberInput({
        path: 'marginLeft',
        name: 'Margin Left',
        defaultValue: 60,
        settings: {
          min: 0,
          step: 5,
          integer: true,
        },
      })
      .addNumberInput({
        path: 'marginRight',
        name: 'Margin Right',
        defaultValue: 0,
        settings: {
          min: 0,
          step: 5,
          integer: true,
        },
      })
      .addNumberInput({
        path: 'marginTop',
        name: 'Margin Top',
        defaultValue: 0,
        settings: {
          min: 0,
          step: 5,
          integer: true,
        },
      })
      .addNumberInput({
        path: 'marginBottom',
        name: 'Margin Bottom',
        defaultValue: 60,
        settings: {
          min: 0,
          step: 5,
          integer: true,
        },
      })
      .addColorPicker({
        path: 'fieldColor1',
        name: 'Metric 1 Color',
        defaultValue: '#73BF69',
        settings: {
          allowUndefined: true,
          disableNamedColors: true,
          textWhenUndefined: 'default',
        },
      })
      .addColorPicker({
        path: 'fieldColor2',
        name: 'Metric 2 Color',
        defaultValue: '#FF9830',
        settings: {
          allowUndefined: true,
          disableNamedColors: true,
          textWhenUndefined: 'default',
        },
      })
      .addColorPicker({
        path: 'fieldColor3',
        name: 'Metric 3 Color',
        defaultValue: '#F2495C',
        settings: {
          allowUndefined: true,
          disableNamedColors: true,
          textWhenUndefined: 'default',
        },
      })
      .addColorPicker({
        path: 'fieldColor4',
        name: 'Metric 4 Color',
        defaultValue: '#5794F2',
        settings: {
          allowUndefined: true,
          disableNamedColors: true,
          textWhenUndefined: 'default',
        },
      })
      .addColorPicker({
        path: 'fieldColor5',
        name: 'Metric 5 Color',
        defaultValue: '#FADE2A',
        settings: {
          allowUndefined: true,
          disableNamedColors: true,
          textWhenUndefined: 'default',
        },
      })
      .addColorPicker({
        path: 'fieldColor6',
        name: 'Metric 6 Color',
        defaultValue: '#B877D9',
        settings: {
          allowUndefined: true,
          disableNamedColors: true,
          textWhenUndefined: 'default',
        },
      })
      .addColorPicker({
        path: 'fieldColor7',
        name: 'Metric 7 Color',
        defaultValue: '#8AB8FF',
        settings: {
          allowUndefined: true,
          disableNamedColors: true,
          textWhenUndefined: 'default',
        },
      })
      .addColorPicker({
        path: 'fieldColor8',
        name: 'Metric 8 Color',
        defaultValue: '#FFA6B0',
        settings: {
          allowUndefined: true,
          disableNamedColors: true,
          textWhenUndefined: 'default',
        },
      });
  })
  .useFieldConfig({
    standardOptions: [FieldConfigProperty.DisplayName],
  });
