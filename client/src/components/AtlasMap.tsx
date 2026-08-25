import { Asset } from "@/lib/atlasData";
import { Minus, Plus, LocateFixed, Layers3, Crosshair } from "lucide-react";
import { useState } from "react";

type AtlasMapProps = {
  assets: Asset[];
  selectedId: string;
  clustered: boolean;
  onSelect: (asset: Asset) => void;
};

const colors = {
  site: "#e8b760",
  domain: "#f8f3e8",
  host: "#ef796a",
  service: "#c88f3e",
  cloud: "#9db4ff",
  provider: "#9a8270",
};

export default function AtlasMap({ assets, selectedId, clustered, onSelect }: AtlasMapProps) {
  const [zoom, setZoom] = useState(1);
  const [terrain, setTerrain] = useState(true);
  const [focusSelection, setFocusSelection] = useState(false);
  const selectedAsset = assets.find((asset) => asset.id === selectedId);

  return (
    <section className="relative min-h-[510px] overflow-hidden rounded-2xl border border-white/10 bg-[#090806] shadow-[0_40px_120px_rgba(0,0,0,.6)]" aria-label="Synthetic engagement atlas">
      <div className="absolute inset-0 atlas-map-grain opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_34%,rgba(231,173,72,.18),transparent_19%),radial-gradient(circle_at_35%_67%,rgba(222,103,76,.12),transparent_16%),linear-gradient(112deg,#060605_0%,#13100b_48%,#080706_100%)]" />
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/25 px-5 py-3 backdrop-blur-md">
        <div>
          <p className="eyebrow">ATLAS / SYNTHETIC WORLD MODEL</p>
          <p className="mt-1 text-xs text-white/50">Coordinate frame: illustrative · uncertainty preserved</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTerrain(!terrain)} className="atlas-icon-button" aria-label="Toggle terrain overlay"><Layers3 size={15} /></button>
          <button onClick={() => { setFocusSelection(true); setZoom(1.2); }} className={`atlas-icon-button ${focusSelection ? "border-[#e8b760]/45 text-[#f0c678]" : ""}`} aria-label="Focus selected synthetic asset" title={selectedAsset ? `Focus ${selectedAsset.name}` : "Focus selected synthetic asset"}><Crosshair size={15} /></button>
          <button onClick={() => setZoom(Math.max(.75, zoom - .1))} className="atlas-icon-button" aria-label="Zoom out"><Minus size={15} /></button>
          <button onClick={() => setZoom(Math.min(1.35, zoom + .1))} className="atlas-icon-button" aria-label="Zoom in"><Plus size={15} /></button>
          <button onClick={() => { setZoom(1); setFocusSelection(false); }} className="atlas-icon-button" aria-label="Reset map view"><LocateFixed size={15} /></button>
        </div>
      </div>

      <svg viewBox="0 0 100 100" className="relative h-[510px] w-full" role="img" aria-label="Illustrative map with selectable synthetic assessment assets">
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth=".15" /></pattern>
          <filter id="glow"><feGaussianBlur stdDeviation="1.1" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <g transform={`translate(50 50) scale(${zoom}) translate(-50 -50)`} className="origin-center transition-transform duration-300">
          <rect width="100" height="100" fill="url(#grid)" opacity=".65" />
          <path d="M5 29C10 19 20 14 30 17c5 2 8 5 12 5 6 0 10-4 17-3 5 1 8 5 7 9-1 4-7 4-10 8-3 5-4 12-9 15-8 4-12-4-17-4-7 0-12 4-18 0-5-4-10-8-7-18Z" fill="rgba(193,145,61,.14)" stroke="rgba(236,187,99,.42)" strokeWidth=".4" />
          <path d="M58 18c7-5 17-4 25 1 7 5 11 13 7 18-3 4-10 1-14 5-5 5-3 14-10 17-6 2-10-4-9-10 0-6-5-9-5-15 0-4 2-6 6-8Z" fill="rgba(176,129,69,.14)" stroke="rgba(236,187,99,.42)" strokeWidth=".4" />
          <path d="M34 58c7-4 15-3 20 1 6 4 7 12 4 19-3 7-10 11-16 9-7-2-13-7-14-14-1-6 1-11 6-15Z" fill="rgba(197,128,66,.12)" stroke="rgba(236,187,99,.38)" strokeWidth=".4" />
          {terrain && <>
            <path d="M2 43C18 38 27 41 43 38S75 38 97 31" fill="none" stroke="rgba(241,211,143,.2)" strokeWidth=".3" strokeDasharray="1 1" />
            <path d="M4 58c16-4 25 4 39 0s35-2 54-9" fill="none" stroke="rgba(241,211,143,.16)" strokeWidth=".3" strokeDasharray="1 1" />
            <path d="M19 5c-4 21 7 43 1 89M45 4c-7 28 6 54 1 92M72 4c-1 32 7 59-2 92" fill="none" stroke="rgba(238,207,136,.14)" strokeWidth=".25" />
          </>}
          <path d="M23 32C31 36 47 48 64 35M47 53C54 49 60 44 68 42M47 53C52 61 54 64 57 68" fill="none" stroke="rgba(233,184,85,.42)" strokeWidth=".45" strokeDasharray="1.1 1.1" />
          {clustered && <g className="cursor-pointer" onClick={() => onSelect(assets[1])} role="button" tabIndex={0} aria-label="Open Northstar synthetic asset cluster" onKeyDown={(event) => event.key === "Enter" && onSelect(assets[1])}><circle cx="28.5" cy="40.5" r="3.1" fill="rgba(232,183,96,.19)" stroke="#e8b760" strokeWidth=".45"/><text x="28.5" y="41.3" textAnchor="middle" className="fill-[#f9e8c5] text-[2.7px] font-bold">2</text></g>}
          {assets.filter((asset) => !clustered || !["edge-helix", "host-203"].includes(asset.id)).map((asset) => {
            const selected = selectedId === asset.id;
            const { x, y } = asset.coordinates;
            return <g key={asset.id} className="cursor-pointer" onClick={() => onSelect(asset)} tabIndex={0} role="button" aria-label={`Select ${asset.name}`} onKeyDown={(event) => event.key === "Enter" && onSelect(asset)}>
              {asset.confidence === "inferred" && <circle cx={x} cy={y} r="4.5" fill="none" stroke={colors[asset.type]} strokeWidth=".35" strokeDasharray=".9 .9" opacity=".65" />}
              {selected && focusSelection && <circle cx={x} cy={y} r="6.1" fill="none" stroke="#e8b760" strokeWidth=".25" strokeDasharray=".8 .8" opacity=".85" />}
              {selected && <circle cx={x} cy={y} r="3.6" fill="none" stroke="#f8f3e8" strokeWidth=".6" opacity=".9" />}
              <circle cx={x} cy={y} r={selected ? 1.75 : 1.2} fill={colors[asset.type]} filter="url(#glow)" />
              <text x={x + 2} y={y - 1.7} className="fill-[#f5ead4] text-[2.1px] font-semibold tracking-[.18em]">{asset.name.split(".")[0].toUpperCase().slice(0, 16)}</text>
            </g>
          })}
        </g>
      </svg>
      <div className="absolute bottom-4 left-5 flex items-center gap-4 text-[10px] uppercase tracking-[.16em] text-white/45">
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#e8b760]" /> verified site</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#ef796a]" /> finding exposure</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#9db4ff]" /> cloud region</span>
      </div>
      <div className="absolute bottom-4 right-5 text-right text-[10px] uppercase tracking-[.16em] text-white/35">{focusSelection && selectedAsset ? `Focused / ${selectedAsset.name}` : "Synthetic coordinate canvas"}<br />No real targets displayed</div>
    </section>
  );
}
