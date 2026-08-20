import type { AlertTemplateProps } from "@gear-js/react-hooks";

import { cx } from "../utils/cx.js";
import styles from "./alert-template.module.css";

/**
 * Themed replacement for the default `AlertProvider` template — every toast raised through
 * `useAlert` (including the ones VDK's transaction components raise) picks up the theme.
 */
export function AlertTemplate({ alert, close }: AlertTemplateProps) {
  const { content, options } = alert;
  const { type, title, isClosed, style } = options;

  return (
    <div className={cx(styles.alert, styles[type])} style={style} role="status">
      <span className={styles.dot} aria-hidden="true" />

      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        {content}
      </div>

      {isClosed && (
        <button type="button" className={styles.close} onClick={close} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
}
