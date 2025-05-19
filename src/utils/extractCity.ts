export function extractCity(input: string): string {
  return input.split(",")[0].trim();
}
