import { Command, HelpCircle, LayoutPanelTop, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

type WorkspaceSection = "mission" | "atlas" | "surface" | "findings" | "intelligence" | "imports" | "reports" | "operations";

export function WorkspaceExperienceControls({ active, onNavigate, onDensityChange, commandPaletteRequest = 0 }: { active: WorkspaceSection; onNavigate: (section: WorkspaceSection) => void; onDensityChange: (density: "comfortable" | "compact") => void; commandPaletteRequest?: number }) {
  const [showGuide, setShowGuide] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("aegis-orientation-dismissed") !== "true");
  const [palette, setPalette] = useState(false);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || event.key === "?") { event.preventDefault(); setPalette(true); }
      if (event.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (commandPaletteRequest > 0) setPalette(true);
  }, [commandPaletteRequest]);
  const dismiss = () => { setShowGuide(false); window.localStorage.setItem("aegis-orientation-dismissed", "true"); };
  const changeDensity = (next: "comfortable" | "compact") => { setDensity(next); onDensityChange(next); };
  const commands: Array<[WorkspaceSection, string, string]> = [["mission", "Mission Control", "G M"], ["atlas", "Earth & Local Atlas", "G A"], ["surface", "Attack Surface", "G S"], ["findings", "Findings", "G F"], ["operations", "Engagement Operations", "G O"]];
  return <>
    {showGuide && <div className="mx-3 mt-3 rounded-lg border border-[#e8b760]/25 bg-[#e8b760]/[.07] p-3 text-xs text-white/65 lg:mx-6"><div className="flex items-start gap-3"><Sparkles size={16} className="mt-0.5 text-[#f2cb82]"/><div className="min-w-0 flex-1"><p className="font-semibold text-[#f5cb80]">Welcome to the authorized assessment workspace</p><p className="mt-1 leading-5">Start with the Earth & Local Atlas to understand synthetic geography, use Operations for governed workflow planning, and open <b>⌘/Ctrl K</b> or <b>?</b> for quick navigation. The public workspace never targets live systems.</p></div><button onClick={dismiss} className="atlas-icon-button shrink-0" aria-label="Dismiss orientation"><X size={14}/></button></div></div>}
    <div className="fixed bottom-4 left-4 z-40 hidden items-center gap-2 rounded-lg border border-white/10 bg-[#0c0b09]/95 px-2 py-1.5 text-[10px] text-white/55 shadow-2xl backdrop-blur lg:flex"><HelpCircle size={13} className="text-[#e8b760]"/><span>Need help? Press ?</span><button onClick={() => setPalette(true)} className="rounded border border-white/10 px-1.5 py-0.5 text-[#f2cb82]">⌘K</button><span className="border-l border-white/10 pl-2">Density</span><button onClick={() => changeDensity(density === "comfortable" ? "compact" : "comfortable")} className="flex items-center gap-1 rounded border border-white/10 px-1.5 py-0.5 text-white/70"><LayoutPanelTop size={11}/>{density}</button></div>
    {palette && <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[15vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Command palette"><div className="w-full max-w-lg rounded-xl border border-[#e8b760]/25 bg-[#11100d] p-3 shadow-[0_0_70px_rgba(232,183,96,.13)]"><div className="flex items-center gap-2 border-b border-white/8 pb-3"><Command size={16} className="text-[#e8b760]"/><p className="text-sm font-semibold text-white/82">Command palette</p><button onClick={() => setPalette(false)} className="atlas-icon-button ml-auto"><X size={14}/></button></div><div className="mt-2 grid gap-1">{commands.map(([section, label, key]) => <button key={section} onClick={() => { onNavigate(section); setPalette(false); }} className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs ${active === section ? "bg-[#e8b760]/10 text-[#f2cb82]" : "text-white/68 hover:bg-white/[.04]"}`}><span>{label}</span><kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-white/42">{key}</kbd></button>)}</div><p className="mt-3 text-[10px] text-white/40">Keyboard navigation is immediate; no action runs until a visible, governed control is selected.</p></div></div>}
  </>;
}
