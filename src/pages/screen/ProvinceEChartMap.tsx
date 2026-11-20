import { useMemo, useState } from "react";
import * as echarts from "echarts";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { JS_CITIES } from "@/data/jiangsuMap";
import { Button } from "@/components/ui/button";
import ScreenChart, { chartColors } from "./ScreenChart";
import type { Activity } from "./provinceActivityData";

const labels: Record<string, [number, number]> = { 苏州: [482, 500], 宿迁: [225, 158], 常州: [351, 445], 无锡: [445, 415], 镇江: [345, 370] };
echarts.registerMap("jiangsu-cognitive", { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="537" viewBox="0 0 600 537">${JS_CITIES.map(c => `<path name="${c.name}" d="${c.d}"/>`).join("")}</svg>` });

export default function ProvinceEChartMap({ city, rows, onPick }: { city: string; rows: Activity[]; onPick: (city: string) => void }) {
  const [zoom, setZoom] = useState(1);
  const option = useMemo(() => {
    const c = chartColors();
    return {
      tooltip: { trigger: "item" as const },
      geo: { map: "jiangsu-cognitive", roam: true, zoom, scaleLimit: { min: 1, max: 3 }, layoutCenter: ["50%", "50%"], layoutSize: "98%", selectedMode: "single" as const,
        itemStyle: { areaColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: c.blue }, { offset: 1, color: c.bottom }]), borderColor: c.cyan, borderWidth: 1.2, shadowColor: c.line, shadowBlur: 12, shadowOffsetY: 8 },
        emphasis: { itemStyle: { areaColor: c.blue, borderColor: c.text, borderWidth: 2 } }, select: { itemStyle: { areaColor: c.gold, borderColor: c.gold, borderWidth: 2 } }, regions: JS_CITIES.map(r => ({ name: r.name, selected: r.name === city, itemStyle: r.name === city ? { areaColor: c.gold, borderColor: c.gold } : undefined })) },
      series: [{ type: "scatter" as const, coordinateSystem: "geo" as const, symbolSize: 5, itemStyle: { color: c.cyan }, label: { show: true, formatter: "{b}", position: "top" as const, color: c.text, fontSize: 20, fontWeight: 600 as const }, data: JS_CITIES.map(r => ({ name: r.name, value: [...(labels[r.name] ?? [r.cx, r.cy]), rows.find(a => a.city === r.name)?.screened ?? 0] })), tooltip: { formatter: (p: unknown) => { const name = (p as { name: string }).name; const row = rows.find(r => r.city === name); return `${name}市<br/>新增筛查 ${row?.screened ?? 0} 人<br/>低 / 中 / 高风险：${row?.low ?? 0} / ${row?.medium ?? 0} / ${row?.high ?? 0}`; } } }],
    };
  }, [city, rows, zoom]);
  return <div className="relative h-full min-h-[460px]" aria-label="江苏省交互地图" onClickCapture={event => { const name = event.target instanceof SVGElement ? event.target.textContent?.trim() : undefined; if (name && JS_CITIES.some(r => r.name === name)) onPick(name); }}>
    <ScreenChart label="江苏省筛查地图" option={option} onSelect={onPick} />
    <div className="absolute bottom-3 right-3 flex gap-1 rounded bg-scr-panel/90 p-1">{[{ icon: Plus, label: "放大地图", action: () => setZoom(z => Math.min(3, z + .2)) }, { icon: Minus, label: "缩小地图", action: () => setZoom(z => Math.max(1, z - .2)) }, { icon: LocateFixed, label: "重置地图", action: () => setZoom(1) }].map(({ icon: Icon, label, action }) => <Button key={label} variant="screenQuiet" size="icon" aria-label={label} title={label} onClick={action}><Icon /></Button>)}</div>
  </div>;
}