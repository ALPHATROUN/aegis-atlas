import { Asset } from "@/lib/atlasData";

export default function AtlasGraph({ selected, assets }: { selected: Asset; assets: Asset[] }) {
  const nodes = [selected, ...assets.filter((asset) => asset.id !== selected.id).slice(0, 4)];
  const positions = [
    { x: 50, y: 50 },
    { x: 19, y: 22 },
    { x: 82, y: 22 },
    { x: 20, y: 78 },
    { x: 81, y: 78 },
  ];
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="mb-2 flex items-center justify-between"><span className="eyebrow">SYNCHRONIZED RELATIONSHIP GRAPH</span><span className="text-[10px] text-white/40">5 shown / 14 linked</span></div>
      <svg viewBox="0 0 100 100" className="h-[176px] w-full" role="img" aria-label="Relationship graph">
        <defs><filter id="graphglow"><feGaussianBlur stdDeviation="1" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        {positions.slice(1).map((position, index) => <path key={index} d={`M 50 50 L ${position.x} ${position.y}`} stroke="rgba(232,183,96,.45)" strokeWidth=".55" strokeDasharray="1.4 1" />)}
        {nodes.map((node, index) => <g key={node.id} filter="url(#graphglow)"><circle cx={positions[index].x} cy={positions[index].y} r={index === 0 ? 8.5 : 5.4} fill={index === 0 ? "#e8b760" : "#302719"} stroke={index === 0 ? "#fff1cb" : "#b88b45"} strokeWidth=".55"/><text x={positions[index].x} y={positions[index].y + .8} textAnchor="middle" fill={index === 0 ? "#150f06" : "#f5ead4"} className="text-[3px] font-bold">{node.type.slice(0, 3).toUpperCase()}</text><text x={positions[index].x} y={positions[index].y + (index === 0 ? 12 : 8.5)} textAnchor="middle" className="fill-[#f5ead4] text-[2.5px]">{node.name.slice(0, 14)}</text></g>)}
      </svg>
      <p className="mt-1 text-xs leading-5 text-white/52">Relationship confidence is preserved across map, graph, and finding context. Inferred links remain visually distinct.</p>
    </div>
  );
}
