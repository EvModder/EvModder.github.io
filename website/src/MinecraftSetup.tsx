import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronRight, GitBranch, Lock, SlidersHorizontal } from "lucide-react";
import profileIcon from "@/assets/profile-icon.png";
import { LinkIcon } from "@/components/LinkIcon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { mods, packs, settings, setup, type ModSource, type PackSource, type SettingChange, type SetupMod, type SetupPack } from "@/data/minecraftSetup";
import { projectDescription } from "@/hooks/projectDescription";

const SHOW_ALL_KEY = "setup:showAllSettings";
// Page width: no sidebars or ads, so wide screens get more columns instead of empty margins.
// Side margins clear the fixed theme toggle (top-2 right-2, 2rem wide), so it never covers content.
const container = "max-w-[150rem] mx-auto px-12";
// Green (text-link) marks clickable things only; headings use the text colour.
const sectionHeading = "font-display text-xl font-bold text-foreground";
// Side note under a section heading.
const sectionNote = "mt-2 text-sm text-muted-foreground leading-relaxed";

// Settings cards are anchored by mod id (#baritone), so the mod list and shared links can point at them.
const modId = new Map(mods.map(mod => [mod.name, mod.id]));
const cardId = (mod: string) => modId.get(mod) ?? mod;

function readShowAll() {
  if (new URLSearchParams(location.search).has("all")) return true;
  // A link to a card that only "All" shows opens in "All".
  const linked = decodeURIComponent(location.hash.slice(1));
  if (linked && !modCards(false).some(card => cardId(card.mod) === linked)) return true;
  try { return localStorage.getItem(SHOW_ALL_KEY) === "1"; } catch { return false; }
}

// Scrolls to a (rendered, open) settings card and briefly highlights its border.
function scrollToCard(id: string, smooth: boolean) {
  const card = document.getElementById(id);
  if (!card) return;
  const motion = smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  card.scrollIntoView({ behavior: motion ? "smooth" : "auto", block: "start" });
  card.classList.remove("card-flash");
  void card.offsetWidth; // restart the animation on repeat clicks
  card.classList.add("card-flash");
}

// "Generic.foo.bar" → group "Generic", name "foo.bar"; keys without a dot stay ungrouped.
function groupChanges(changes: readonly SettingChange[]) {
  const groups = new Map<string, { name: string; change: SettingChange }[]>();
  for (const change of changes) {
    const dot = change.key.indexOf(".");
    const group = dot < 0 ? "" : change.key.slice(0, dot);
    const list = groups.get(group) ?? [];
    list.push({ name: dot < 0 ? change.key : change.key.slice(dot + 1), change });
    groups.set(group, list);
  }
  return [...groups];
}

const ACRONYMS = new Set(["db", "gui", "hud", "ipc", "ui"]); // written lowercase in some keys
// Config keys mix camelCase, kebab-case, snake_case and prose; split them into lowercase words (acronyms kept).
const words = (key: string) => key
  .replace(/^iFrame/, "itemFrame")
  .replace(/[-_]+/g, " ")
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
  .split(/\s+/)
  .filter(Boolean)
  .map(word => /^[A-Z0-9]{2,}$/.test(word) ? word : ACRONYMS.has(word.toLowerCase()) ? word.toUpperCase() : word.toLowerCase());
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// Setting names in sentence case; nested keys joined with "›"; malilib's trailing ".enabled" toggle dropped.
function settingLabel(name: string) {
  const parts = name.split(".");
  if (parts.length > 1 && parts.at(-1) === "enabled") parts.pop();
  return parts.map(part => capitalize(words(part).join(" "))).join(" › ");
}

// Group names (mod categories, hacks, modules) in Title Case, keeping names already written that way (AirPlace).
const groupLabel = (group: string) => /^[A-Z][A-Za-z0-9]*( [A-Z][A-Za-z0-9]*)*$/.test(group)
  ? group
  : words(group).map(capitalize).join(" ");

// Values: booleans as on/off, enum-like words lowercased, floats trimmed, vanilla ids without namespace,
// mappings as "a→b" (no hyphen to wrap at), and comma lists spaced so they wrap between items.
function display(value: SettingChange["value"]) {
  if (typeof value === "boolean") return value ? "on" : "off";
  if (typeof value === "number") return String(Math.round(value * 1000) / 1000);
  if (/^[A-Za-z]+([ _][A-Za-z]+)*$/.test(value)) return value.toLowerCase().replaceAll("_", " ");
  return value.replaceAll("minecraft:", "").replaceAll("->", "→").replace(/,(?=\S)/g, ", ");
}

// How many columns of at least `min` rem (with `gap` rem between them) fit the element; re-measured on resize.
function useColumns(min: number, gap: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current!;
    const measure = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      setCount(Math.max(1, Math.floor((el.clientWidth + gap * rem) / ((min + gap) * rem))));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [min, gap]);
  return [ref, count] as const;
}

// One card per mod; a mod's config files become blocks inside it.
function modCards(showAll: boolean) {
  const cards = new Map<string, { file: string; changes: readonly SettingChange[] }[]>();
  for (const { mod, file, changes } of settings) {
    const shown = showAll ? changes : changes.filter(change => !change.extra);
    if (shown.length) cards.set(mod, [...cards.get(mod) ?? [], { file, changes: shown }]);
  }
  return [...cards].map(([mod, files]) => ({ mod, files, count: files.reduce((n, f) => n + f.changes.length, 0) }));
}

// Value/default columns sized per card (monospace, so in ch) to its longest inline entry, leaving the rest to
// setting names; phones cap them so names keep some room.
const tableGrid = "grid grid-cols-[minmax(0,1fr)_min(var(--value),4.5rem)_min(var(--default),4rem)] sm:grid-cols-[minmax(0,1fr)_var(--value)_var(--default)] gap-x-2 sm:gap-x-3";
const LONG = 16; // longer values and defaults get their own line instead of a column
const columnWidth = (texts: string[]) =>
  `${Math.max("default".length, ...texts.map(text => [...text].length).filter(n => n <= LONG))}ch`;
const longLine = "col-span-3 wrap-anywhere pl-3 pb-1";

function ChangeRows({ changes }: { changes: readonly SettingChange[] }) {
  return groupChanges(changes).map(([group, rows]) => [
    group && <span key={group} className="col-span-3 mt-3 mb-0.5 font-semibold text-foreground">{groupLabel(group)}</span>,
    ...rows.map(({ name, change }) => {
      // Values or defaults too long for their column get their own full-width line under the label.
      const value = display(change.value), fallback = display(change.default);
      const longValue = value.length > LONG, longDefault = fallback.length > LONG;
      return (
        <span key={change.key} className="contents">
          <span title={change.key} className={`text-muted-foreground ${longValue ? (longDefault ? "col-span-3" : "col-span-2") : ""}`}>
            {group === "Enabled" ? groupLabel(name) : settingLabel(name)}
          </span>
          {!longValue && <span className="text-right wrap-anywhere font-medium text-foreground">{value}</span>}
          {longDefault ? !longValue && <span /> : <span className="text-right wrap-anywhere text-muted-foreground">{fallback}</span>}
          {longValue && (
            <span className={`${longLine} font-medium text-foreground`}>
              {value.split("; ").map(line => <span key={line} className="block">{line}</span>)}
            </span>
          )}
          {longDefault && <span className={`${longLine} text-muted-foreground`}>default: {fallback}</span>}
        </span>
      );
    }),
  ]);
}

// Open state lives in the page, not the DOM: cards move between column elements when the column count changes.
function SettingsCard({ mod, files, count, open, onToggle }:
  ReturnType<typeof modCards>[number] & { open: boolean; onToggle: (open: boolean) => void }) {
  const changes = files.flatMap(file => file.changes);
  const widths = {
    "--value": columnWidth(changes.map(change => display(change.value))),
    "--default": columnWidth(changes.map(change => display(change.default))),
  } as React.CSSProperties;
  return (
    <details id={cardId(mod)} open={open} onToggle={e => onToggle(e.currentTarget.open)} style={widths}
      className="group bg-card pixel-border rounded-lg min-w-0 scroll-mt-16">
      <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer list-none select-none rounded-lg hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-4 shrink-0 text-link transition-transform group-open:rotate-90" />
        <span className="font-display text-sm font-semibold truncate">{mod}</span>
        <span className="ml-auto font-display text-xs text-muted-foreground tabular-nums">{count}</span>
      </summary>
      <div className="px-3 sm:px-4 pb-4 pt-1 space-y-5">
        {files.map(({ file, changes }) => (
          <div key={file} className={`${tableGrid} gap-y-1 font-display text-xs leading-5`}>
            <span className="contents text-[11px] text-muted-foreground">
              {/* Phones: the path gets its own line above the column labels. */}
              <code className="col-span-3 sm:col-span-1 wrap-anywhere sm:truncate">{file}</code>
              <span className="sm:hidden" />
              <span className="text-right">value</span>
              <span className="text-right">default</span>
            </span>
            <span className="col-span-3 border-b border-border mb-1" />
            <ChangeRows changes={changes} />
          </div>
        ))}
      </div>
    </details>
  );
}

// A mod or resource pack in a list.
type Entry = SetupMod | SetupPack;
type Source = ModSource | PackSource;

// Hover note for entries that differ from the linked project (none: the linked project as-is).
const SOURCE_NOTES: Record<Source, string> = {
  fork: "Public fork",
  local: "Local patch; link is to the upstream",
  private: "Not public",
  mine: "My own pack",
  discord: "Shared in a Discord server",
};

// My avatar as a stencil in the text colour, so it doesn't read as Modrinth green.
const evIcon = <span aria-hidden className="size-3.5 shrink-0 bg-foreground" style={{ mask: `url(${profileIcon}) center / contain no-repeat` }} />;

// Icon before each name (legend order): where the linked project is published, or the entry's source.
type Marker = "modrinth" | "github" | "web" | Source;
const MARKERS: Record<Marker, { legend: string; icon: React.ReactNode }> = {
  modrinth: { legend: "Modrinth", icon: <LinkIcon name="Modrinth" className="size-3.5 shrink-0 text-modrinth" /> },
  github: { legend: "GitHub", icon: <LinkIcon name="GitHub" className="size-3.5 shrink-0 text-foreground" /> },
  web: { legend: "website", icon: <LinkIcon name="Website" className="size-3.5 shrink-0 text-foreground" /> },
  discord: { legend: "Discord", icon: <LinkIcon name="Discord" className="size-3.5 shrink-0 text-discord" /> },
  mine: { legend: "mine", icon: evIcon },
  fork: { legend: "public fork", icon: evIcon },
  local: { legend: "local fork", icon: <GitBranch aria-hidden className="size-3.5 shrink-0 text-local" /> },
  private: { legend: "private", icon: <Lock aria-hidden className="size-3.5 shrink-0 text-private" /> },
};

function markerOf(entry: Entry): Marker {
  if (entry.source) return entry.source;
  if (entry.url?.startsWith("https://github.com/")) return "github";
  return entry.url?.startsWith("https://modrinth.com/") ? "modrinth" : "web";
}

// Under the section note. The "Key" label makes it read as a key, not the list's first row.
const SourceLegend = ({ items }: { items: readonly Entry[] }) => (
  <p aria-label="Source key" className="mt-1.5 mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-display text-xs text-muted-foreground">
    <span aria-hidden className="text-[0.625rem] uppercase tracking-widest">Key</span>
    {(Object.keys(MARKERS) as Marker[]).filter(marker => items.some(item => markerOf(item) === marker)).map(marker => (
      <span key={marker} className="inline-flex items-center gap-1.5">{MARKERS[marker].icon}{MARKERS[marker].legend}</span>
    ))}
  </p>
);

// Site paths are downloads served from website/public/; anything else opens in a new tab.
const linkTarget = (url: string) => url.startsWith("/") ? { download: "" } : { target: "_blank", rel: "noopener noreferrer" };

// Fixed list column widths and gap (rem), so spacing stays constant; each width fits its list's longest name.
const MOD_COLUMN = 14, PACK_COLUMN = 17, LIST_GAP = 1.25;

// Column-first layout: the fewest rows that fit, then the fewest columns for those rows; lengths differ by at
// most one (the longer columns first). place(i): the grid cell of the i-th item.
function listLayout(count: number, fit: number) {
  const columns = Math.ceil(count / Math.ceil(count / Math.max(1, fit)));
  const short = Math.floor(count / columns), longItems = (count % columns) * (short + 1);
  const place = (i: number) => i < longItems
    ? { gridColumn: Math.floor(i / (short + 1)) + 1, gridRow: i % (short + 1) + 1 }
    : { gridColumn: count % columns + Math.floor((i - longItems) / short) + 1, gridRow: (i - longItems) % short + 1 };
  return { columns, place };
}

// counts: changed settings per mod name, for the mods that have a card in the current Core/All view.
function EntryList({ items, column, counts, onReveal }: {
  items: readonly Entry[]; column: number; counts?: ReadonlyMap<string, number>; onReveal?: (id: string) => void;
}) {
  const tipId = useId();
  const [tip, setTip] = useState<{ id: string; note?: string; text: string; left: number; top: number } | null>(null);
  const hovered = useRef<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [frame, fit] = useColumns(column, LIST_GAP);
  const { columns, place } = listLayout(items.length, fit);

  // Tooltip: the source note at once, then the project's live description once it arrives.
  const show = (mod: Entry, anchor: HTMLElement) => {
    hovered.current = mod.id;
    const note = mod.source && SOURCE_NOTES[mod.source];
    const place = (text: string) => {
      const list = listRef.current;
      if (hovered.current !== mod.id || !list || !(text || note)) return;
      const box = list.getBoundingClientRect(), link = anchor.getBoundingClientRect();
      setTip({ id: mod.id, note, text, left: Math.min(link.left - box.left, box.width - 256), top: link.bottom - box.top + 4 });
    };
    place("");
    if (mod.url) projectDescription(mod.url).then(place);
  };
  const hide = () => { hovered.current = null; setTip(null); };
  const tipProps = (mod: Entry) => ({
    "aria-describedby": tip?.id === mod.id ? tipId : undefined,
    onPointerEnter: (e: React.PointerEvent<HTMLElement>) => show(mod, e.currentTarget), onPointerLeave: hide,
    onFocus: (e: React.FocusEvent<HTMLElement>) => show(mod, e.currentTarget), onBlur: hide,
  });

  // Column-major (alphabetical down each column); a grid, since CSS multi-column balances differently per browser.
  return (
    <div ref={frame} className="relative">
      <ul ref={listRef} className="grid text-sm" style={{
        gridTemplateColumns: `repeat(${columns}, ${column}rem)`, columnGap: `${LIST_GAP}rem`,
      }}>
        {items.map((mod, i) => (
          <li key={mod.id} className="flex items-center py-0.5" style={place(i)}>
            {/* The icon sits inside the link (or the private name's hover target), so it is clickable too. */}
            <span>
              {mod.url ? (
                <a href={mod.url} {...linkTarget(mod.url)} {...tipProps(mod)}
                  className="group inline-flex items-center gap-2 align-top text-foreground">
                  {MARKERS[markerOf(mod)].icon}<span className="underline-offset-3 group-hover:underline">{mod.name}</span>
                </a>
              ) : (
                <span tabIndex={0} {...tipProps(mod)} className="inline-flex items-center gap-2 align-top text-muted-foreground">
                  {MARKERS[markerOf(mod)].icon}{mod.name}
                </span>
              )}
              {counts?.has(mod.name) && (
                <a href={`#${mod.id}`} title={`${counts.get(mod.name)} changed settings`}
                  aria-label={`${mod.name}: ${counts.get(mod.name)} changed settings`}
                  onClick={e => { e.preventDefault(); history.pushState(null, "", `#${mod.id}`); onReveal?.(mod.id); }}
                  className="ml-2 inline-flex items-center gap-1 font-display text-xs tabular-nums text-link hover:underline underline-offset-3">
                  <SlidersHorizontal className="size-3" aria-hidden />{counts.get(mod.name)}
                </a>
              )}
            </span>
          </li>
        ))}
      </ul>
      {tip && (
        <div id={tipId} role="tooltip" style={{ left: Math.max(0, tip.left), top: tip.top }}
          className="pointer-events-none absolute z-20 w-max max-w-64 rounded-md border border-border bg-card px-3 py-2 text-xs leading-snug text-foreground shadow-lg">
          {tip.note && <p className="text-muted-foreground">{tip.note}</p>}
          {tip.text && <p className={tip.note ? "mt-1" : ""}>{tip.text}</p>}
        </div>
      )}
    </div>
  );
}

export default function MinecraftSetup() {
  const [showAll, setShowAll] = useState(readShowAll);
  const choose = (next: boolean) => {
    setShowAll(next);
    try { localStorage.setItem(SHOW_ALL_KEY, next ? "1" : "0"); } catch { /* storage unavailable */ }
  };
  const cards = modCards(showAll);
  const counts = new Map(cards.map(card => [card.mod, card.count]));

  const [openCards, setOpenCards] = useState<ReadonlySet<string>>(() => new Set());
  const setOpen = (id: string, open: boolean) => setOpenCards(prev => {
    if (prev.has(id) === open) return prev;
    const next = new Set(prev);
    if (open) next.add(id); else next.delete(id);
    return next;
  });
  // Opening a card from the mod list or a #mod link: open it, then scroll once it has rendered open.
  const [reveal, setReveal] = useState<{ id: string; smooth: boolean } | null>(null);
  const revealCard = (id: string, smooth: boolean) => { setOpen(id, true); setReveal({ id, smooth }); };
  useLayoutEffect(() => { if (reveal) scrollToCard(reveal.id, reveal.smooth); }, [reveal]);

  // Cards render after the lazy page loads, so the browser's own jump to #mod misses; do it here and on hash changes.
  useEffect(() => {
    const onHash = (smooth: boolean) => location.hash && revealCard(decodeURIComponent(location.hash.slice(1)), smooth);
    onHash(false);
    const listener = () => onHash(true);
    addEventListener("hashchange", listener);
    return () => removeEventListener("hashchange", listener);
  }, []); // revealCard only uses state setters, so the first render's copy stays valid
  // Cards wide enough that nearly every setting name fits on one line.
  const [cardFrame, columns] = useColumns(28, 0.75);
  const perColumn = Math.ceil(cards.length / columns);

  return (
    <div className="setup-page min-h-screen bg-background">
      <div className="fixed top-2 right-2 z-50"><ThemeToggle /></div>
      <header className="border-b border-border">
        <div className={`${container} py-5`}>
          <h1 className="font-display font-bold text-3xl md:text-4xl leading-none">My Setup</h1>
          <p className="mt-2 text-muted-foreground">
            The mods and settings I use on 2b2t
          </p>
          <p className="mt-2 font-display text-xs text-muted-foreground">
            Minecraft {setup.minecraft} &middot;{" "}
            <a href="https://fabricmc.net/use/installer/" target="_blank" rel="noopener noreferrer" className="text-link hover:underline">{setup.loader}</a> &middot;{" "}
            <span className="whitespace-nowrap">{setup.system}</span> &middot;{" "}
            <span className="whitespace-nowrap">updated <span className="text-foreground">{setup.reviewed}</span></span>
          </p>
        </div>
      </header>

      <main className={`${container} pt-8 pb-16`}>
        <section aria-labelledby="packs-heading">
          <h2 id="packs-heading" className={sectionHeading}>Resource packs</h2>
          <div className="mt-3"><EntryList items={packs} column={PACK_COLUMN} /></div>
        </section>

        <section aria-labelledby="mods-heading" className="mt-8">
          <h2 id="mods-heading" className={sectionHeading}>Installed mods</h2>
          <p className={sectionNote}>
            Some mods are personal forks or private builds, so you might not get 100% identical
            behavior in your own setup.
          </p>
          <SourceLegend items={mods} />
          <EntryList items={mods} column={MOD_COLUMN} counts={counts} onReveal={id => revealCard(id, true)} />
        </section>

        <section id="settings" aria-labelledby="settings-heading" className="mt-8 scroll-mt-6">
          <div className="flex items-baseline justify-between gap-4 mb-4">
            <h2 id="settings-heading" className={sectionHeading}>Changed settings</h2>
            <div role="group" aria-label="Settings shown" className="font-display text-xs text-muted-foreground">
              {([["Core", false], ["All", true]] as const).map(([label, value], i) => (
                <span key={label}>
                  {i > 0 && <span className="mx-1.5">/</span>}
                  <button type="button" onClick={() => choose(value)} aria-pressed={showAll === value}
                    className="cursor-pointer text-link hover:underline underline-offset-3 aria-pressed:cursor-default aria-pressed:text-foreground aria-pressed:font-semibold aria-pressed:underline">
                    {label}
                  </button>
                </span>
              ))}
            </div>
          </div>
          {/* Independent columns (filled column-first), so opening a card never leaves gaps beside it. */}
          <div ref={cardFrame} className="grid auto-cols-fr grid-flow-col gap-3 items-start">
            {Array.from({ length: columns }, (_, c) => (
              <div key={c} className="grid gap-3 min-w-0">
                {cards.slice(c * perColumn, (c + 1) * perColumn).map(card => (
                  <SettingsCard key={card.mod} {...card} open={openCards.has(cardId(card.mod))}
                    onToggle={open => setOpen(cardId(card.mod), open)} />
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
