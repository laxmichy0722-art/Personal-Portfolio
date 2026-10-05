/**
 * Minimum-time-to-submit signal for the contact form.
 *
 * Bot defences need to know roughly how long a form was open before it was
 * submitted. Held in module state rather than a React ref on purpose: nothing
 * depends on this value re-rendering when it changes, and the React compiler's
 * lint rules reject a ref that is read inside a callback handed to another
 * function (which is exactly what React Hook Form's `handleSubmit` is).
 *
 * A single module-level value is the correct granularity — there is one contact
 * form per page, and the visitor who starts in one tab and submits in another
 * is handled by `relaxFillTimer`.
 */

let startedAt = 0;

/** Called on mount. Only records the first start so re-renders cannot reset it. */
export function startFillTimer() {
  if (startedAt === 0) startedAt = Date.now();
}

/**
 * Keeps the earliest plausible start time, so returning to a backgrounded tab
 * does not make a genuine submission look instant.
 */
export function relaxFillTimer() {
  if (startedAt !== 0) startedAt = Math.min(startedAt, Date.now());
}

/** Restarts the clock after a successful submission. */
export function resetFillTimer() {
  startedAt = Date.now();
}

/**
 * Milliseconds the form was open. `undefined` when the timer never started, in
 * which case the server falls back to its own minimum-time check.
 */
export function getFillDurationMs(): number | undefined {
  return startedAt === 0 ? undefined : Date.now() - startedAt;
}