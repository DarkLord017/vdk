import { useState } from "react";

import type { Showcase, ShowcaseProps } from "../showcase/types.js";

const WIDTHS = [
  { id: "fill", label: "Fill", width: "100%" },
  { id: "tablet", label: "768", width: "768px" },
  { id: "phone", label: "390", width: "390px" },
] as const;

type Props = {
  showcase: Showcase;
  props: ShowcaseProps;
  onProp: (id: string, value: string | boolean) => void;
};

export function PreviewCanvas({ showcase, props, onProp }: Props) {
  const { Demo } = showcase;
  const [widthId, setWidthId] = useState<(typeof WIDTHS)[number]["id"]>("fill");

  const width = WIDTHS.find((item) => item.id === widthId) ?? WIDTHS[0];

  return (
    <div className="pg-preview">
      <header className="pg-preview-head">
        <div>
          <h2>{showcase.name}</h2>
          <p>{showcase.description}</p>
        </div>

        <div className="pg-segmented pg-widths" role="group" aria-label="Preview width">
          {WIDTHS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === widthId ? "is-active" : undefined}
              onClick={() => setWidthId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* The stage carries the theme's own background, so components sit on their real
          surface rather than on the playground's chrome. */}
      <div className="pg-stage" style={{ maxWidth: width.width }}>
        <Demo props={props} />
      </div>

      {showcase.note && <p className="pg-note">{showcase.note}</p>}

      {showcase.controls.length > 0 && (
        <div className="pg-controls">
          {showcase.controls.map((control) => {
            if (control.type === "boolean") {
              return (
                <label className="pg-check" key={control.id}>
                  <input
                    type="checkbox"
                    checked={props[control.id] === true}
                    onChange={(event) => onProp(control.id, event.target.checked)}
                  />
                  <span>{control.label}</span>
                </label>
              );
            }

            if (control.type === "select") {
              return (
                <label className="pg-field" key={control.id}>
                  <span>{control.label}</span>
                  <select
                    value={String(props[control.id] ?? control.defaultValue)}
                    onChange={(event) => onProp(control.id, event.target.value)}
                  >
                    {control.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            return (
              <label className="pg-field" key={control.id}>
                <span>{control.label}</span>
                <input
                  type="text"
                  value={String(props[control.id] ?? "")}
                  onChange={(event) => onProp(control.id, event.target.value)}
                />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
