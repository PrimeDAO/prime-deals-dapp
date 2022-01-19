import {autoinject} from "aurelia-framework";
import { IClause } from "configurations/apiSchema";
import { LocalStorageService } from "./LocalStorageService";
import { DEAL_CLAUSES } from "./mockData";

@autoinject
export class DataStorageService {

  constructor(private localStorageService: LocalStorageService) { }

  public async getAllClauses(): Promise<IClause[]> {
    const existingData = this.localStorageService.getClausesData();
    if (existingData) {
      return Promise.resolve(existingData);
    }

    return Promise.resolve(DEAL_CLAUSES);
  }

  public async getOneClause(id: number): Promise<IClause> {
    const clauses = await this.getAllClauses();
    const targetClause = clauses[id];
    return targetClause;
  }
}
