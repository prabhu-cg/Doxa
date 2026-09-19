/** Catches every other path under `/org/[slug]/**` for the `@modal`
 * slot and renders nothing, so navigating anywhere that isn't one of
 * the intercepted drawer routes closes whatever drawer was open —
 * see the Next.js parallel-routes docs' own "Closing the modal"
 * example, which this mirrors. */
export default function ModalSlotCatchAll() {
  return null;
}
