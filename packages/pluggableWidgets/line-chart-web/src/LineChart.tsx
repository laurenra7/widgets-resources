import classNames from "classnames";
import { createElement, ReactElement, useCallback } from "react";
import { ChartWidget, ChartWidgetProps } from "@mendix/shared-charts";
import { getPlotChartDataTransforms, usePlotChartDataSeries } from "@mendix/shared-charts/hooks";
import { LineChartContainerProps } from "../typings/LineChartProps";

const lineChartLayoutOptions: ChartWidgetProps["layoutOptions"] = {
    xaxis: {
        zeroline: true,
        fixedrange: true,
        gridcolor: "#d7d7d7",
        zerolinecolor: "#d7d7d7"
    },
    yaxis: {
        fixedrange: true,
        gridcolor: "#d7d7d7",
        zeroline: true,
        zerolinecolor: "#d7d7d7"
    }
};
const lineChartConfigOptions: ChartWidgetProps["configOptions"] = {
    responsive: true
};
const lineChartSeriesOptions: ChartWidgetProps["seriesOptions"] = {};

export function LineChart(props: LineChartContainerProps): ReactElement | null {
    const chartLines = usePlotChartDataSeries(
        props.lines,
        useCallback(
            (line, dataPoints) => ({
                type: "scatter",
                mode: line.lineStyle === "line" ? "lines" : "lines+markers",
                line: {
                    shape: line.interpolation,
                    color: line.lineColor?.value
                },
                marker: {
                    color: line.markerColor?.value
                },
                transforms: getPlotChartDataTransforms(line.aggregationType, dataPoints)
            }),
            []
        )
    );

    return (
        <ChartWidget
            type="LineChart"
            className={classNames("widget-line-chart", props.class)}
            data={chartLines ?? []}
            width={props.width}
            widthUnit={props.widthUnit}
            height={props.height}
            heightUnit={props.heightUnit}
            showLegend={props.showLegend}
            xAxisLabel={props.xAxisLabel?.value}
            yAxisLabel={props.yAxisLabel?.value}
            gridLinesMode={props.gridLines}
            showSidebarEditor={props.enableDeveloperMode}
            customLayout={props.customLayout}
            customConfig={props.customConfigurations}
            layoutOptions={lineChartLayoutOptions}
            configOptions={lineChartConfigOptions}
            seriesOptions={lineChartSeriesOptions}
            enableThemeConfig={props.enableThemeConfig}
        />
    );
}
