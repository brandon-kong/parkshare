export function capitalize(str: string): string {
  return str
    .substring(0, 1)
    .toUpperCase()
    .concat(str.substring(1).toLowerCase());
}
