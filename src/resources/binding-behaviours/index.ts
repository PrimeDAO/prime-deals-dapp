export function toBoolean(value: any) { // TODO remove this function because Aurelia should be able to automatically convert values to booleans. The is a bug right now in the framework that is getting fixed by Brandon (Aurelia author)
  return value === "true" || value === "" || Boolean(value);
}
