import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

export function chartColors() {
  const root = document.querySelector(".province-clean") ?? document.documentElement;
  const css = getComputedStyle(root);
  const color = (name: string) => `hsl(${css.getPropertyValue(`--scr-${name}`).trim()})`;
  return { text: color("text"), dim: color("dim"), cyan: color("cyan"), blue: color("blue"), gold: color("gold"), panel: color("panel"), line: color("line"), bottom: color("map-bottom") };
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
    chart.current?.setOption({ textStyle: { color: c.text, fontSize: 17 }, animation: false, tooltip: { backgroundColor: c.panel, borderColor: c.line, textStyle: { color: c.text, fontSize: 17 } }, ...option }, true);
  }, [option]);
  return <div ref={host} role="img" aria-label={label} className="h-full min-h-0 w-full" />;
}