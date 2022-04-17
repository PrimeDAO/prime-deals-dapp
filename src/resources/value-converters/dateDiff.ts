import { autoinject } from "aurelia-framework";
import { DateService } from "../../services/DateService";

@autoinject
export class DateDiffValueConverter {
  constructor(private dateService: DateService) { }

  public toView(dateLike: string, format: "float"): string | null {
    let input: Date | number;

    if (format === "float") {
      input = parseFloat(dateLike);
    } else {
      input = new Date(dateLike);
    }

    const result = this.dateService.formattedTime(input).diff();
    return result;
  }
}
