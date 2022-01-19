import { IClause } from "configurations/apiSchema";

const DEALS_DATA = "DEALS_STORAGE_V1";
const CLAUSES_DATA = "DEALS_STORAGE_V1";

export class LocalStorageService {
  public getClausesData(): IClause[] {
    const clausesData = this.getItem(CLAUSES_DATA);
    return clausesData as unknown as IClause[];
  }

  private getItem(key = DEALS_DATA): Record<string, unknown> {
    const result = localStorage.getItem(key);

    if (!result) return;
    if (Object.keys(result).length === 0) return;

    return JSON.parse(result);
  }

  setItem(data: Record<string, unknown>): void {
    localStorage.setItem(DEALS_DATA, JSON.stringify(data));
  }
}
