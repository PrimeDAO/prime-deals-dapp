import { IClause } from "configurations/apiSchema";

const DEALS_DATA = "DEALS_STORAGE_V1";
const CLAUSES_DATA = "DEALS_STORAGE_V1";

export class LocalStorageService {
  public getClausesData(): IClause[] {
    const clausesData = this.getItem<IClause[]>(CLAUSES_DATA);
    return clausesData;
  }

  private getItem<T>(key = DEALS_DATA): T {
    const result = localStorage.getItem(key);

    if (!result) return;
    if (Object.keys(result).length === 0) return;

    return JSON.parse(result) as T;
  }

  setItem(data: Record<string, unknown>): void {
    localStorage.setItem(DEALS_DATA, JSON.stringify(data));
  }
}
