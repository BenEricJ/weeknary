import { FileText, Mail, Layout, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FocusStep {
  id: string;
  label: string;
  info: string;
  icon: LucideIcon;
}

export const FOCUS_STEPS: FocusStep[] = [
  {
    id: "s1",
    label: "Mietvertrag prüfen",
    info: "Suche nach 'Nachmieter' Klausel",
    icon: FileText,
  },
  {
    id: "s2",
    label: "Nachricht an Vermieter",
    info: "Draft in Notizen vorhanden",
    icon: Mail,
  },
  {
    id: "s3",
    label: "Nachmieter-Inserat vorbereiten",
    info: "Fotos machen & Text schreiben",
    icon: Layout,
  },
  {
    id: "s4",
    label: "Besichtigungstermine planen",
    info: "Zeitfenster für Samstag blocken",
    icon: Calendar,
  },
];