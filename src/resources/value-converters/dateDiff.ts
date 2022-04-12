import { autoinject } from "aurelia-framework";
import { DateService } from "../../services/DateService";

@autoinject
export class DateDiffValueConverter {
  constructor(private dateService: DateService) { }

  public toView(dateString: string): string | null {
    const result = this.dateService.formattedTime(new Date(dateString)).diff();
    return result;
  }
}
