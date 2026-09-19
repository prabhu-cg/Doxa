/** Matches the bare `/org/[slug]` route for the `@modal` slot — renders
 * nothing so navigating (client-side) straight to the org dashboard from
 * an open drawer closes it, instead of leaving the last drawer content
 * stuck on screen (parallel routes otherwise keep a slot's last active
 * state across an unrelated navigation). */
export default function ModalSlotRoot() {
  return null;
}
