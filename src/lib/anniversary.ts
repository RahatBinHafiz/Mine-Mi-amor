export function getAnniversaryOrdinal(date: Date = new Date()): string {
  const startYear = 2026;
  const startMonth = 2; // March (0-indexed in JS)
  
  const elapsedMonths = (date.getFullYear() - startYear) * 12 + (date.getMonth() - startMonth);
  const nth = Math.max(1, elapsedMonths);
  
  const s = ["th", "st", "nd", "rd"];
  const v = nth % 100;
  const ordinal = nth + (s[(v - 20) % 10] || s[v] || s[0]);
  return ordinal;
}

export function getCurrentAnniversaryDateStr(date: Date = new Date()): string {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `17 ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}
