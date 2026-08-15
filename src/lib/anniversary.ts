export function getAnniversaryOrdinal(): string {
  return "5th";
}

export function getCurrentAnniversaryDateStr(): string {
  return "17 August 2026";
}

export function getAnniversaryTargetDate(): Date {
  // 5th Month Anniversary on August 17, 2026
  return new Date('2026-08-17T00:00:00');
}
