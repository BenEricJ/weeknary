# Weeknary Design Guide

Wiederverwendbare Design-Regeln, extrahiert aus den Plan- und Ernährungs-Screens.
Dieses Dokument dient als verbindliche Referenz für alle neuen Screens (Training, Schlaf, Review, etc.).

---

## 1. App-Shell

| Element | Klassen |
|---------|---------|
| **RootLayout** (Phone-Frame) | `sm:w-[390px] sm:h-[844px] sm:rounded-[40px] shadow-2xl bg-[#FAF9F6]` |
| **Bottom-Navigation** | `absolute inset-x-0 bottom-0 h-[80px] bg-[#FAF9F6]/75 backdrop-blur-md px-4 pb-4 pt-2` |
| **Nav aktiv** | `text-[#5E7A5E]` + Icon `fill-[#5E7A5E]/10 stroke-[#5E7A5E]` |
| **Nav inaktiv** | `text-gray-400` |
| **Nav-Label** | `text-[10px] font-medium` |

---

## 2. Farbpalette

### Primär
| Name | Hex | Verwendung |
|------|-----|------------|
| Sage Green | `#5E7A5E` | Aktive States, Nav, Selektion |
| Medium Green | `#6A816A` | Buttons, primäre Aktionen, Tabs |
| Dark Green | `#4A634A` | Text-Akzente, Status-Text |

### Sekundär (Themen-Akzente)
| Name | Hex | Verwendung |
|------|-----|------------|
| Orange | `#D37F36` | Training, Intensität |
| Blau | `#5B88A5` | Workout, Edit-Actions |
| Lila | `#6A5F8F` | Schlaf, Supplements |
| Rot | `#B85450` | Delete, Fehler |

### Oberflächen
| Name | Hex | Verwendung |
|------|-----|------------|
| App-Background | `#FAF9F6` | Haupthintergrund |
| Drawer-Background | `#F5F4EF` | Drawer-Hintergrund |
| Nested Section | `#F7F6F1` / `#F8F7F2` | Eingebettete Bereiche |
| Input-Background | `#FAF9F5` | Form-Inputs |
| Planning-Panel BG | `#F7F9F5` | Planning-Panels |
| Empty-State BG | `#F6F8F1` | Leere Zustände |

### Borders
| Name | Hex | Verwendung |
|------|-----|------------|
| Standard | `#EBEAE4` | Karten, Sections, Divider |
| Green-tinted | `#DCE4DC` | Planning-Panels |
| Warm | `#E5E0D4` | Orchestration-Panels |
| Empty-State (dashed) | `#C7D3BE` | Leere Zustände |
| Button-Secondary | `#DDE6D7` | Sekundäre Buttons |

### Overlays
| Klasse | Verwendung |
|--------|------------|
| `bg-black/40` | Drawer-Overlay |
| `bg-black/60` | Dunkle Stats-Bars |
| `bg-white/50` – `bg-white/80` | Glassmorphism-Elemente |

### Mahlzeit-Farben (Ernährung)
| Slot | Badge-BG | Badge-Text | Gradient |
|------|----------|------------|----------|
| Frühstück | `#F5EEE2` | `#A56A2A` | `135deg, #F9F1E2 → #F4E8D5 → #F8F6F1` |
| Mittagessen | `#E9F1E8` | `#5A775A` | `135deg, #EAF2E6 → #DDE9D8 → #F4F2EC` |
| Abendessen | `#ECE9F5` | `#6A5F8F` | `135deg, #ECE9F8 → #E2DEF2 → #F5F2EE` |
| Snack | `#F6EEE4` | `#A36A3B` | `135deg, #F8EFE3 → #F2E3D0 → #F8F5F0` |

---

## 3. Typografie

| Stufe | Klassen | Beispiel |
|-------|---------|---------|
| **Hero-Titel** | `text-[24px] font-bold leading-tight text-gray-900` | Drawer Hero-Überschrift |
| **Seiten-Header** | `text-2xl font-bold` | „Wochenplan" |
| **Drawer-Titel** | `text-[16px] font-bold text-gray-900` | Drawer-Header-Bar |
| **Card-Titel** | `text-[15px] font-bold leading-tight text-gray-900` | Empty-State Titel |
| **Content-Header** | `text-[13px] font-bold text-gray-900` | Event-Titel, Werte |
| **Tab-Text** | `text-[12.5px]` | Tab-Navigation |
| **Body** | `text-[12px] font-medium text-gray-500` | Standard-Body |
| **Small Body** | `text-[11px] font-semibold` | Button-Text, Beschreibung |
| **Section-Header** | `text-[11px] font-bold uppercase tracking-wider text-gray-500` | Abschnitt-Überschriften |
| **Badge-Text** | `text-[9px] font-semibold` | Badges, Chips |
| **Micro** | `text-[10px] font-medium` | Kalender-Labels (`Mo`, `Di`, ...) |

Kalender- und Datumslabels in App-Headern verwenden zweibuchstabige Wochentage (`Mo`, `Di`, `Mi`, `Do`, `Fr`, `Sa`, `So`) statt ausgeschriebener Namen.

### Line Heights
- `leading-none` (1) – kompakte Labels
- `leading-tight` (1.25) – Subtitles, Badges
- `leading-snug` (1.375) – Mehrzeilige Beschreibungen
- `leading-relaxed` (1.625) – Body-Paragraphen

---

## 4. Border Radius

| Wert | Verwendung |
|------|------------|
| `rounded-full` | Avatare, Pill-Badges, Indikatoren |
| `rounded-t-[24px]` | Drawer-Oberkante |
| `rounded-[20px]` | Form-Sections, große Cards |
| `rounded-[18px]` | Panel-Container |
| `rounded-[16px]` | Standard-Cards, Calendar |
| `rounded-[14px]` | Detail-Sections |
| `rounded-[12px]` | Buttons, Inputs, kleine Cards |
| `rounded-[8px]` | Kleine Buttons |
| `rounded-[6px]` | Mini-Badges |

---

## 5. Spacing

### Padding
| Wert | Verwendung |
|------|------------|
| `p-2.5` | Kompakte Cards (KPI, Calendar) |
| `p-3` | Nested Sections, Ingredient-Items |
| `p-4` | Standard Cards und Panels |
| `p-5` | Tab-Content, Drawer-Content |
| `px-4 py-3` | Drawer-Header |
| `px-6 pt-6 pb-4` | App-Header |
| `px-4 pb-8 pt-3` | Drawer-Footer |

### Vertical Spacing (space-y)
| Wert | Verwendung |
|------|------------|
| `space-y-2` / `space-y-2.5` | Dichte Listen |
| `space-y-3` | List-Items |
| `space-y-4` | Detail-Gruppen, Form-Felder |
| `space-y-6` | Major Sections |
| `space-y-7` | Top-Level Drawer-Sections |

### Gap
| Wert | Verwendung |
|------|------------|
| `gap-1` / `gap-1.5` | Icon + Text |
| `gap-2` | Badges, Chips, kleine Grid-Items |
| `gap-3` | Items + Icons, Grid-Columns |
| `gap-4` | Sections, Action-Buttons |

---

## 6. Shadows & Depth

- **Cards/Buttons**: `shadow-sm` (Standard)
- **Active Calendar**: `shadow-md`
- **Header/Nav Glass**: `backdrop-blur-md`
- **Hero Depth**: `blur-2xl` auf `bg-white/50` Kreisen (absolut positioniert)

---

## 7. Drawer-Pattern

Alle Drawer verwenden `vaul`. Struktur via `<DetailDrawer>` Template:

```
DetailDrawer
├── Header (back + title + actions)
├── Hero Section (optional, 200-240px)
├── Tab Navigation (optional, sticky)
├── Scrollable Content (sections + cards)
└── Footer (buttons)
```

→ Siehe `src/app/components/ui/DetailDrawer.tsx`

---

## 8. Card-Patterns

| Pattern | Klassen |
|---------|---------|
| **Standard-Card** | `rounded-[16px] border border-[#EBEAE4] bg-white p-4 shadow-sm` |
| **Panel-Card** | `rounded-[18px] border border-[#DCE4DC] bg-[#F7F9F5] p-4 shadow-sm` |
| **Form-Section** | `rounded-[20px] border border-[#EBEAE4] bg-white p-4 shadow-sm` |
| **KPI-Card** | `rounded-[12px] border border-gray-100 bg-white p-2.5 shadow-sm` |
| **Macro-Card** | `rounded-[14px] border border-[#EBEAE4] bg-[#F8F7F2] p-3` |
| **Focus-Card** | `flex flex-col rounded-[20px] border border-[#E6EBE6] bg-[#F2F4F2] p-4 shadow-sm` + `height: 174px; min-height: 174px` |

→ Siehe `SectionCard`, `FormSection` in `src/app/components/ui/DetailDrawer.tsx`

Fokus-Container am Anfang von Plan-/Ernährung-/Training-/Schlaf-Screens verwenden einheitlich `174px` Höhe. Die KPI-Zeile sitzt mit `mt-auto` am unteren Rand; interne KPI-Karten bleiben kompakt (`h-[58px]`), damit Titel, Beschreibung und Werte nicht überlaufen.

### Schlaf-Analyse-Patterns

| Pattern | Klassen / Regeln |
|---------|------------------|
| **Sleep-Hero** | `rounded-[20px] border border-[#E7E4DF] bg-white p-4 shadow-sm`; links Score-Ring, rechts letzte Nacht, Status-Pills und Phasenbalken |
| **Phasenbalken** | `h-4 overflow-hidden rounded-[4px]`; Segmentfarben: Tief `#3F2E63`, REM `#7563A0`, Leicht `#B8ADD7`, Wach `#DDD7EF` |
| **Phasen-KPI** | `rounded-[12px] border border-gray-100 bg-white p-2.5 shadow-sm`; 4 Spalten, Labels `text-[8px] uppercase`, Werte `text-[14px] font-bold` |
| **Window-Range** | `rounded-[18px] border border-gray-100 bg-white p-4 shadow-sm`; Zeitfenster als flacher Range-Balken mit zwei Handles, keine echte Slider-Abhängigkeit |
| **Trend-Sparkline** | SVG `polyline` in kompakter Zeile; Score/Bedtime in Lila/Grün, Effizienz/Abweichungen bei Bedarf warmes Orange |
| **Checklist-Row** | `grid min-h-[54px] grid-cols-[auto_minmax(0,1fr)_auto_auto]`; Icon-Kachel links, Zeit rechts, runder Check-Button ganz rechts |

Schlaf-Screens behalten `AppTabHeader`, `WeekCalendar`, `OverviewSectionHeader`, Empty-State und Bottom-Nav wie Plan/Ernährung/Training. Die Analyse-Sektionen darunter dürfen höher und dichter sein als Fokus-Cards, solange sie weiße Cards, `shadow-sm`, `rounded-[18px]` bis `rounded-[20px]` und den Schlaf-Akzent `#6A5F8F` verwenden.

---

## 9. Buttons

| Typ | Klassen |
|-----|---------|
| **Primär** | `rounded-[12px] bg-[#6A816A] text-white text-[13px] font-bold py-3.5 shadow-sm active:scale-95` |
| **Sekundär** | `rounded-[12px] border border-[#DDE6D7] bg-white text-[#4A634A] text-[12px] font-bold py-3 shadow-sm active:scale-[0.98]` |
| **Ghost** | `rounded-[8px] bg-[#F5F4EF] text-gray-700 text-[11px] font-bold px-3 py-2` |
| **Icon** | `h-11 w-11 rounded-full border border-gray-200 bg-white text-[#5E7A5E] shadow-sm active:scale-95` |
| **Close** | `rounded-full p-1 text-gray-900 hover:bg-gray-100` |

---

## 10. Forms

| Element | Klassen |
|---------|---------|
| **Input** | `h-11 rounded-[12px] border-[#EBEAE4] bg-[#FAF9F5] focus:border-[#6A816A]` |
| **Textarea** | `min-h-24 rounded-[12px] border-[#EBEAE4] bg-[#FAF9F5]` |
| **Checkbox** | `h-4 w-4 accent-[#5E7A5E]` |
| **Segmented** | Container `rounded-[16px] bg-[#EBEAE4] p-1`, aktiv `h-10 rounded-[12px] bg-white shadow-sm` |
| **Select** | `h-11 rounded-[12px] border-[#EBEAE4] bg-[#FAF9F5]` |

---

## 11. Icons (Lucide React)

| Größe | Verwendung |
|-------|------------|
| `size-3` / `size-4` | Mini-Badges, Toggle |
| `size-5` / `size-6` | Standard in Headers |
| `size-8` / `size-9` | In Cards |
| `size-12` | Hero-Section, Empty State |
| `size={22}` | Mahlzeit-Slot-Icons |
| `size={24}` | Navigation, Back-Buttons |

**Icon-Container:**
- Circular: `w-9 h-9 rounded-full bg-gray-50/80 flex items-center justify-center`
- Square: `w-12 h-12 rounded-[16px] bg-white/80 flex items-center justify-center shadow-sm`

---

## 12. Animationen

| Art | Klassen / Config |
|-----|-----------------|
| **Button-Press** | `active:scale-95` / `active:scale-[0.98]` |
| **Hover** | `hover:bg-gray-100` |
| **Transitions** | `transition-colors` / `transition-transform` / `transition-all` |
| **Duration** | `duration-300` (schnell), `duration-500` (standard), `duration-700` (Progress) |
| **Tab-Content** | `animate-in fade-in duration-300` |
| **Swipe Spring** | `{ type: "spring", stiffness: 420, damping: 34 }` |

---

## 13. Empty State

```
rounded-[20px] border border-dashed border-[#C7D3BE] bg-[#F6F8F1] p-5 text-center shadow-sm
├── Icon: h-12 w-12 rounded-[16px] bg-white shadow-sm mx-auto
├── Titel: text-[15px] font-bold mt-3
├── Beschreibung: text-[12px] text-gray-600 mt-1 max-w-[300px]
└── Buttons: grid grid-cols-1 gap-2 sm:grid-cols-2 mt-4
```

→ Siehe `CalendarEmptyState` Komponente

---

## 14. Progress Bars

| Variante | Container | Filled |
|----------|-----------|--------|
| Standard | `h-1.5 bg-[#E4E9E4] rounded-full` | `bg-[#5E7A5E] transition-all duration-500` |
| Nutrition | `h-2 bg-[#E4E7DE] rounded-full` | Farbe je nach Nährstoff |

---

## 15. Status-Badges

| Status | Klassen |
|--------|---------|
| Gut | `rounded-full px-2.5 py-1 text-[11px] font-bold bg-[#EAF2E8] text-[#4A634A]` |
| Warnung | `rounded-full px-2.5 py-1 text-[11px] font-bold bg-[#F8EEE1] text-[#A36A3B]` |
| Info | `rounded-full px-2.5 py-1 text-[11px] font-bold bg-[#F0EBF7] text-[#6A5F8F]` |

---

## 16. Divider

- **Horizontal**: `h-px bg-[#EBEAE4]`
- **Vertikal**: `w-[1px] h-6 bg-[#E6EBE6]`
- **Zwischen Kindern**: `divide-y divide-[#EBEAE4]`

---

## 17. Template-Komponenten

Alle wiederverwendbaren Template-Komponenten befinden sich in `src/app/components/ui/`:

| Komponente | Datei | Beschreibung |
|------------|-------|--------------|
| `DetailDrawer` | `DetailDrawer.tsx` | Drawer-Shell mit Header, Hero, Tabs, Content, Footer |
| `SectionHeading` | `DetailDrawer.tsx` | Section-Header (uppercase, tracking-wider) |
| `SectionCard` | `DetailDrawer.tsx` | Card-Container für Content-Sections |
| `FormSection` | `DetailDrawer.tsx` | Form-Container (rounded-[20px]) |
| `DetailRow` | `DetailDrawer.tsx` | Icon + Label + Value Zeile |
| `ProgressBar` | `DetailDrawer.tsx` | Animierter Fortschrittsbalken |
| `StatusBadge` | `DetailDrawer.tsx` | Status-Badge (success/warning/info) |
| `PageHeader` | `PageShell.tsx` | Seiten-Header mit Icon, Titel, Actions |
| `PageShell` | `PageShell.tsx` | Seiten-Container mit Header + scrollbarem Content |

---

## 18. Zahlenformatierung

Alle Zahlen im deutschen Format (Komma als Dezimaltrenner):
- Gramm: `value.toFixed(1).replace(".", ",") + " g"`
- Milligramm: `value.toFixed(0) + " mg"`
- Prozent: `Math.round(value * 100) + " %"`
