import { autoinject } from "aurelia-framework";
import { DateService } from "services/DateService";
import "./discussionsList.scss";

export interface IDiscussion {
  id: string,
  topic: string,
  creator: string,
  createdAt: Date,
  replies: number,
  lastActivity: number | null,
}

@autoinject
export class DiscussionsList{

  dateFormatOptions = { year: "numeric", month: "short", day: "numeric" };
  discussions: Array<IDiscussion> = [];

  paginationConfig = {
    listLength: 5,
    maxVisiblePages: 5,
  };

  constructor(
    private dateService: DateService,
  ) {}

  getDiscussions = async (): Promise<void> => {
    this.discussions = await [
      {
        id: "1",
        topic: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
        creator: "John Doe",
        createdAt: new Date(2022, 0, 1),
        replies: 2,
        lastActivity: Math.floor(this.dateService.getDurationBetween(new Date(), new Date(2022, 0, 2)).asDays()),
      },
    ];
  };

  attached(): void {
    this.getDiscussions();
  }
}
