import { presets, type ColorTokens, type VdkTheme, type VdkThemeInput } from "@vara-dk/theme";

type Props = {
  theme: VdkTheme;
  presetId: string;
  scheme: "light" | "dark";
  onPreset: (id: string) => void;
  onScheme: (scheme: "light" | "dark") => void;
  onToken: (update: VdkThemeInput) => void;
  onReset: () => void;
};

const COLOR_GROUPS: { title: string; tokens: (keyof ColorTokens)[] }[] = [
  { title: "Brand", tokens: ["primary", "primaryForeground", "ring", "accent"] },
  { title: "Surface", tokens: ["background", "foreground", "card", "cardForeground"] },
  {
    title: "Support",
    tokens: ["secondary", "secondaryForeground", "muted", "mutedForeground", "border", "input"],
  },
  { title: "Status", tokens: ["success", "warning", "danger", "dangerForeground"] },
];

const FONTS = [
  { label: "Anuphan (Vara)", value: '"Anuphan", -apple-system, BlinkMacSystemFont, sans-serif' },
  { label: "System sans", value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { label: "JetBrains Mono", value: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace' },
  { label: "Georgia serif", value: 'Georgia, "Times New Roman", serif' },
];

export function ThemeEditor({
  theme,
  presetId,
  scheme,
  onPreset,
  onScheme,
  onToken,
  onReset,
}: Props) {
  return (
    <aside className="pg-panel pg-editor">
      <div className="pg-panel-head">
        <h2>Theme</h2>
        <button type="button" className="pg-link" onClick={onReset}>
          Reset
        </button>
      </div>

      <label className="pg-field">
        <span>Preset</span>
        <select value={presetId} onChange={(event) => onPreset(event.target.value)}>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>

      <div className="pg-field">
        <span>Color scheme</span>
        <div className="pg-segmented">
          {(["light", "dark"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={value === scheme ? "is-active" : undefined}
              onClick={() => onScheme(value)}
            >
              {value === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </div>

      {COLOR_GROUPS.map((group) => (
        <section className="pg-group" key={group.title}>
          <h3>{group.title}</h3>

          <div className="pg-swatches">
            {group.tokens.map((token) => (
              <label className="pg-swatch" key={token}>
                <input
                  type="color"
                  value={toHex(theme.colors[token])}
                  onChange={(event) => onToken({ colors: { [token]: event.target.value } })}
                />
                <span className="pg-swatch-name">{token}</span>
                <span className="pg-swatch-value">{theme.colors[token]}</span>
              </label>
            ))}
          </div>
        </section>
      ))}

      <section className="pg-group">
        <h3>Shape &amp; scale</h3>

        <Slider
          label="Radius"
          value={parsePx(theme.radius.md)}
          min={0}
          max={28}
          onChange={(value) =>
            onToken({
              radius: {
                sm: `${Math.max(0, Math.round(value * 0.6))}px`,
                md: `${value}px`,
                lg: `${Math.round(value * 1.6)}px`,
              },
            })
          }
        />

        <Slider
          label="Spacing unit"
          value={theme.spacing.unit}
          min={2}
          max={8}
          onChange={(value) => onToken({ spacing: { unit: value } })}
        />

        <Slider
          label="Base font size"
          value={parsePx(theme.typography.fontSize.md)}
          min={11}
          max={20}
          onChange={(value) =>
            onToken({
              typography: {
                fontSize: {
                  xs: `${value - 2}px`,
                  sm: `${value - 1}px`,
                  md: `${value}px`,
                  lg: `${value + 2}px`,
                  xl: `${value + 6}px`,
                },
              },
            })
          }
        />

        <Slider
          label="Control height"
          value={parsePx(theme.sizing.controlHeight.md)}
          min={28}
          max={60}
          onChange={(value) =>
            onToken({
              sizing: {
                controlHeight: {
                  sm: `${Math.round(value * 0.8)}px`,
                  md: `${value}px`,
                  lg: `${Math.round(value * 1.2)}px`,
                },
              },
            })
          }
        />
      </section>

      <section className="pg-group">
        <h3>Typography</h3>

        <label className="pg-field">
          <span>Font family</span>
          <select
            value={theme.typography.fontFamily}
            onChange={(event) => onToken({ typography: { fontFamily: event.target.value } })}
          >
            {FONTS.map((font) => (
              <option key={font.label} value={font.value}>
                {font.label}
              </option>
            ))}
            {!FONTS.some((font) => font.value === theme.typography.fontFamily) && (
              <option value={theme.typography.fontFamily}>Custom</option>
            )}
          </select>
        </label>
      </section>
    </aside>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="pg-slider">
      <span className="pg-slider-head">
        {label}
        <em>{value}px</em>
      </span>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function parsePx(value: string): number {
  return Number.parseInt(value, 10) || 0;
}

/** `<input type="color">` only accepts #rrggbb, so non-hex tokens fall back to black. */
function toHex(value: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [r, g, b] = value.slice(1);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#000000";
}
