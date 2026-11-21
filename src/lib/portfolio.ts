import { PortfolioEntry } from '../store/portfolioSlice';

export function sortPortfolioEntriesBySerial(entries: PortfolioEntry[]): PortfolioEntry[] {
  return entries
    .map((entry, index) => ({ entry, index, serial: Number(entry.serial) }))
    .sort((first, second) => {
      const firstSerial = Number.isFinite(first.serial) ? first.serial : Number.MAX_SAFE_INTEGER;
      const secondSerial = Number.isFinite(second.serial) ? second.serial : Number.MAX_SAFE_INTEGER;
      return firstSerial - secondSerial || first.index - second.index;
    })
    .map(({ entry }) => entry);
}
