import axios from "axios";
import { bindable } from "aurelia-framework";
import "./markdown.scss";

const marked = require("marked");

export class Markdown{

  @bindable document: string;
  @bindable url: string;
  private markdown = "";

  attached(): void {
    if (this.url) {
      axios.get(this.url)
        .then((response) => {
          if (response.data && response.data.length) {
            this.markdown = marked(response.data);
          }
        });
    } else {
      this.markdown = marked(this.document);
    }
  }
}

export function initialize(): void {
  // const renderer = {
  //   link(href: string, title: string, text: string) {
  //     // return `<a href="${href}">${text} blossom</a>`;
  //     return `<a href="#" click="navigate()">${text} blossom</a>`;
  //   },
  // };

  // marked.use({ renderer });
  marked.setOptions({ gfm: true });
}
