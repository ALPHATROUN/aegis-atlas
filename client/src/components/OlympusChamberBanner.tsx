import { type AtlasSection } from "@/lib/atlasRoutes";
import { Compass, Flame, Landmark, Network, ScrollText, ShieldCheck, Sparkles, Telescope } from "lucide-react";

const chambers: Record<AtlasSection, { name: string; domain: string; question: string; boundary: string; tone: string; Icon: typeof Compass }> = {
  mission: { name: "ACROPOLIS COMMAND", domain: "ASSESSMENT ORIENTATION", question: "What changed across the declared assessment, and which evidence deserves review now?", boundary: "Scope and synthetic-data guardrails remain enforced.", tone: "gold", Icon: Landmark },
  atlas: { name: "HELIOS CARTOGRAPHIUM", domain: "GEOGRAPHIC OBSERVABILITY", question: "Where does authorized geography alter relationship, coverage, and uncertainty context?", boundary: "Maps show synthetic records and governed spatial context only.", tone: "sky", Icon: Telescope },
  surface: { name: "ARES PERIMETER", domain: "EXPOSURE REVIEW", question: "Which declared assets, services, and dependencies require accountable review?", boundary: "No active probing, exploitation, or target interaction occurs here.", tone: "ember", Icon: ShieldCheck },
  findings: { name: "ATHENA’S TRIBUNAL", domain: "EVIDENCED DECISION", question: "Which findings are evidenced, owned, and eligible for a governed retest decision?", boundary: "Lifecycle changes remain local or protected workflow records.", tone: "gold", Icon: ShieldCheck },
  intelligence: { name: "HERMES CONSTELLATION", domain: "RELATIONSHIP INTELLIGENCE", question: "How do assets, evidence, services, and providers connect inside the authorized model?", boundary: "Relationship context is source-bounded and synthetic in public mode.", tone: "cyan", Icon: Network },
  imports: { name: "HEPHAESTUS FORGE", domain: "GOVERNED INGESTION", question: "Is a proposed dataset valid, in scope, and properly quarantined before any workspace use?", boundary: "Imports are previewed and validated without external retrieval.", tone: "ember", Icon: Flame },
  reports: { name: "MUSES’ ARCHIVE", domain: "DELIVERY AND PROVENANCE", question: "Is the evidence basis ready for the requested audience and export boundary?", boundary: "Exports preserve synthetic-only disclosure and provenance context.", tone: "violet", Icon: ScrollText },
  operations: { name: "ZEUS’ STEWARDSHIP", domain: "ENTERPRISE ASSURANCE", question: "Are governance, delivery, identity, and tenant readiness conditions visible and accountable?", boundary: "No customer tenant, connector, or external action is activated in public mode.", tone: "storm", Icon: Sparkles },
};

export function OlympusChamberBanner({ section }: { section: AtlasSection }) {
  const chamber = chambers[section];
  const Icon = chamber.Icon;
  return <section className={`atlas-chamber-banner atlas-chamber-${chamber.tone}`} aria-label={`${chamber.name} workspace identity`}><div className="atlas-chamber-mark"><Icon size={19} /></div><div><p className="eyebrow">{chamber.domain} / OLYMPUS ATLAS</p><h2>{chamber.name}</h2><p>{chamber.question}</p></div><div className="atlas-chamber-boundary"><ShieldCheck size={14} /><span>{chamber.boundary}</span></div></section>;
}
