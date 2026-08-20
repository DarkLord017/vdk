import type { Showcase, ShowcaseProps } from "../showcase/types.js";

type Props = {
  showcase: Showcase;
  props: ShowcaseProps;
  onProp: (id: string, value: string | boolean) => void;
};

export function PreviewCanvas({ showcase, props, onProp }: Props) {
  const { Demo } = showcase;

  return (
    <div className="pg-preview">
      <header className="pg-preview-head">
        <div>
          <h2>{showcase.name}</h2>
          <p>{showcase.description}</p>
        </div>
      </header>

      <div className="pg-stage">
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
