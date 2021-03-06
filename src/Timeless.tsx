import React from 'react';
import { PanelProps, LoadingState } from '@grafana/data';
import { css, cx } from 'emotion';
import { stylesFactory, getTheme } from '@grafana/ui';
import { Data, PlotType } from 'plotly.js';
import Plot from 'react-plotly.js';

type BarType = 'group' | 'stack';
type InterpolationType = 'linear' | 'log';

export interface TimelessOptions {
  plotType: string;
  barType: BarType;
  showLegend: boolean;
  percentage: boolean;
  fieldColor1: string;
  fieldColor2: string;
  fieldColor3: string;
  fieldColor4: string;
  fieldColor5: string;
  fieldColor6: string;
  fieldColor7: string;
  fieldColor8: string;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  showXAxisTitle: boolean;
  showYAxisTitle: boolean;
  titleSize: number;
  lat: number;
  lon: number;
  zoom: number;
  radius: number;
  radius_use_data: boolean;
  interpType: InterpolationType;
  zlimits: boolean;
  zmin: number;
  zmax: number;
  zmid: number;
}

interface Props extends PanelProps<TimelessOptions> {}

declare global {
  interface Array<T> {
    Unique(): T[];
  }
}

Array.prototype.Unique = function() {
  function onlyUnique(value: any, index: number, self: string | any[]) {
    return self.indexOf(value) === index;
  }
  return this.filter(onlyUnique);
};

export class TimelessPanel extends React.Component<Props> {
  theme = getTheme();
  styles = getStyles();

  render() {
    const { data, height, width, options } = this.props;
    const styles = this.styles;
    const theme = this.theme;
    const traces: Data[] = [];

    if (data.state === LoadingState.Done && data.series.length < 1) {
      throw new Error('Query returned no results');
    }

    const fields = data.series[0].fields;
    let metrics: any[] | undefined;
    let X: any[] | undefined;
    let Y: any[] | undefined;
    let Xname: string | undefined;
    let Yname: string | undefined;
    let Mname: string | undefined;
    const tp = ['line', 'scatter'].includes(options.plotType) ? 'scattergl' : (options.plotType as PlotType);
    let mode: 'lines' | 'markers' | undefined = undefined;
    if (options.plotType === 'line') {
      mode = 'lines';
    } else if (options.plotType === 'scatter') {
      mode = 'markers';
    }
    let mapboxLayout = undefined;
    if (data.state === LoadingState.Done) {
      if (options.plotType === 'densitymapbox') {
        for (const field of fields) {
          if (field.name === 'metric' || field.name === 'metrics') {
            metrics = field.values.toArray();
            Mname = field.config.displayName || field.name;
          } else if (field.name === 'lat') {
            X = field.values.toArray();
            Xname = field.config.displayName || field.name;
          } else if (field.name === 'lon') {
            Y = field.values.toArray();
            Yname = field.config.displayName || field.name;
          } else {
            break;
          }
        }
      } else {
        for (const field of fields) {
          if (field.name === 'metric' || field.name === 'metrics') {
            metrics = field.values.toArray();
            Mname = field.config.displayName || field.name;
          } else if (X === undefined) {
            X = field.values.toArray();
            Xname = field.config.displayName || field.name;
          } else if (Y === undefined) {
            Y = field.values.toArray();
            Yname = field.config.displayName || field.name;
          } else {
            break;
          }
        }
      }

      const colors = [
        options.fieldColor1,
        options.fieldColor2,
        options.fieldColor3,
        options.fieldColor4,
        options.fieldColor5,
        options.fieldColor6,
        options.fieldColor7,
        options.fieldColor8,
      ];

      if (!X || !Y) {
        throw new Error('Query returned insufficient x,y data');
      }

      if (metrics?.length) {
        if (options.plotType === 'heatmap') {
          traces.push({
            type: options.plotType,
            x: X,
            y: Y,
            z: metrics,
            colorscale: [
              [0, '#5794F2'],
              [0.5, '#73BF69'],
              [1, '#F2495C'],
            ],
            hovertemplate: `${Xname}: %{x}<br>${Yname}: %{y}<br>${Mname}: %{z}<extra></extra>`,
            xgap: 2,
            ygap: 2,
          });
        } else if (options.plotType === 'densitymapbox') {
          let r: number | number[] = options.radius;
          if (options.radius_use_data) {
            const max = Math.max(...metrics);
            const logmax = Math.log(max);
            r =
              options.interpType === 'log'
                ? metrics.map(v => (options.radius * v) / max)
                : metrics.map(v => (options.radius * Math.log(v)) / logmax);
          }
          traces.push({
            type: options.plotType,
            lat: X,
            lon: Y,
            z: metrics,
            radius: r,
            zmin: options.zlimits ? options.zmin : undefined,
            zmax: options.zlimits ? options.zmax : undefined,
            zmid: options.zlimits ? options.zmid : undefined,
            colorscale: [
              [0, '#5794F2'],
              [0.5, '#73BF69'],
              [1, '#F2495C'],
            ],
            hovertemplate: `${Xname}: %{lat}<br>${Yname}: %{lon}<br>${Mname}: %{z}<extra></extra>`,
          });
          mapboxLayout = {
            center: {
              lat: options.lat,
              lon: options.lon,
            },
            zoom: options.zoom,
            style: 'open-street-map',
          };
        } else {
          const uniqueMetrics = metrics.Unique();
          const uniqueX = X.Unique();
          const plotY = uniqueX.map(_v => 0);
          const Ys: number[][] = [];

          for (let i = 0; i < uniqueMetrics.length; i++) {
            const metric = uniqueMetrics[i];
            const next_trace: Data = {
              type: tp,
              mode: mode,
              x: uniqueX,
              marker: {
                color: colors[i],
              },
              name: metric,
            };
            traces.push(next_trace);
            Ys.push([...plotY]);
          }

          for (let i = 0; i < metrics.length; i++) {
            const metric = metrics[i];
            const x = X[i];
            const y = Y[i];
            const mid = uniqueMetrics.indexOf(metric);
            const xid = uniqueX.indexOf(x);
            Ys[mid][xid] = y;
          }

          if (options.percentage) {
            for (let i = 0; i < plotY.length; i++) {
              const ys = uniqueMetrics.map((_, j) => Ys[j][i]);
              const sum = ys.reduce((p, c) => p + c, 0);
              uniqueMetrics.forEach((_, j) => {
                Ys[j][i] = (100 * Ys[j][i]) / sum;
              });
            }
          }

          for (let i = 0; i < traces.length; i++) {
            traces[i].y = Ys[i];
          }
        }
      } else {
        traces.push({
          type: tp,
          x: X,
          y: Y,
          mode: mode,
          marker: {
            color: colors[0],
          },
          name: Yname,
        });
      }
    }

    return (
      <div
        className={cx(
          styles.wrapper,
          css`
            width: ${width}px;
            height: ${height}px;
          `
        )}
      >
        <Plot
          data={traces}
          layout={{
            barmode: options.plotType === 'bar' ? options.barType : undefined,
            width: width,
            height: height,
            plot_bgcolor: theme.colors.bg1,
            paper_bgcolor: theme.colors.bg1,
            title: { font: { color: theme.colors.text } },
            xaxis: {
              title: options.showXAxisTitle
                ? {
                    text: Xname,
                    font: {
                      family: theme.typography.fontFamily.sansSerif,
                      color: theme.colors.text,
                      size: options.titleSize,
                    },
                  }
                : undefined,
              linecolor: theme.colors.text,
              tickcolor: theme.colors.text,
              tickfont: { color: theme.colors.text },
              type: 'category',
            },
            yaxis: {
              title: options.showYAxisTitle
                ? {
                    text: Yname,
                    font: {
                      family: theme.typography.fontFamily.sansSerif,
                      color: theme.colors.text,
                      size: options.titleSize,
                    },
                  }
                : undefined,
              linecolor: theme.colors.text,
              tickcolor: theme.colors.text,
              tickfont: {
                color: theme.colors.text,
                family: theme.typography.fontFamily.sansSerif,
              },
            },
            margin: {
              l: options.marginLeft,
              r: options.marginRight,
              b: options.marginBottom,
              t: options.marginTop,
            },
            showlegend: options.showLegend,
            legend: {
              font: {
                color: theme.colors.text,
                family: theme.typography.fontFamily.sansSerif,
              },
            },
            mapbox: mapboxLayout,
          }}
          config={{
            modeBarButtonsToRemove: ['lasso2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
            displaylogo: false,
            mapboxAccessToken:
              options.plotType === 'densitymapbox'
                ? 'pk.eyJ1Ijoia2dvbmlkaXMiLCJhIjoiY2tlY3hyZHBkMGdidjJxcDNyanhqZmF0ZCJ9.fpUmRv0Mb7XwB7cYojQGiA'
                : undefined,
          }}
        />
      </div>
    );
  }
}

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
});
