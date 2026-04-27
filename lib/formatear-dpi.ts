export function formatearDpi(dpi: string) {
  const d = dpi.replace(/\D/g, "");
  if (d.length === 13) {
    return `${d.slice(0, 4)} ${d.slice(4, 9)} ${d.slice(9, 13)}`;
  }
  if (d.length > 0) {
    return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }
  return dpi;
}
