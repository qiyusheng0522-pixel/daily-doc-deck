import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

export function staticChartOption(option: EChartsOption): EChartsOption {
  const withoutTransitions = <T extends object>(entry: T) => ({ ...entry, animation: false, stateAnimation: { duration: 0, delay: 0 } });
  const series = option.series ? (Array.isArray(option.series) ? option.series : [option.series]).map(withoutTransitions) : undefined;
  const geo = option.geo ? (Array.isArray(option.geo) ? option.geo : [option.geo]).map(withoutTransitions) : undefined;
  return { ...option, animation: false, animationDuration: 0, animationDurationUpdate: 0, ...(series ? { series } : {}), ...(geo ? { geo } : {}) };
}

export function chartColors() {
  const root = document.querySelector(".province-clean") ?? document.documentElement;
  const css = getComputedStyle(root);
  const color = (name: string) => `hsl(${css.getPropertyValue(`--scr-${name}`).trim()})`;
  return { text: color("text"), dim: color("dim"), cyan: color("cyan"), blue: color("blue"), gold: color("gold"), panel: color("panel"), line: color("line"), bottom: color("map-bottom"), palette: [color("cyan"), color("blue"), color("chart-third"), color("chart-fourth")] };
}

export default function ScreenChart({ option, label, onSelect }: { option: EChartsOption; label: string; onSelect?: (name: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts>();
  const select = useRef(onSelect);
  select.current = onSelect;
  useEffect(() => {
    if (!host.current) return;
    const instance = echarts.init(host.current, undefined, { renderer: "svg" });
    chart.current = instance;
    instance.on("click", event => { if (event.name) select.current?.(event.name); });
    instance.on("geoselectchanged", event => {
      const region = (event as { name?: string }).name;
      if (region) select.current?.(region);
    });
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(host.current);
    return () => { observer.disconnect(); instance.dispose(); chart.current = undefined; };
  }, []);
  useEffect(() => {
    const c = chartColors();
    const instance = chart.current;
    if (!instance || instance.isDisposed()) return;
    // Global animation:false does not disable ECharts emphasis/select transitions.
    // Stop any in-flight gradient interpolation before replacing its displayables.
    instance.getZr().storage.traverse(element => element.stopAnimation());
    instance.setOption(staticChartOption({ textStyle: { color: c.text, fontSize: 17 }, tooltip: { backgroundColor: c.panel, borderColor: c.line, textStyle: { color: c.text, fontSize: 17 } }, ...option }), { notMerge: true, lazyUpdate: false });
  }, [option]);
  return <div ref={host} role="img" aria-label={label} className="h-full min-h-0 w-full" />;
}