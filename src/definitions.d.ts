/**
 * @since 17.0.0
 *
 * Creates a deep clone of an object.
 */
declare function structuredClone<T>(
  value: T,
  transfer?: { transfer: ReadonlyArray<import("worker_threads").TransferListItem> },
): T;
