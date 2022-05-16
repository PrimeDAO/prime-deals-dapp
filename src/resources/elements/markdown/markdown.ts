import axios from "axios";
import { bindable } from "aurelia-framework";
import "./markdown.scss";

const marked = require("marked");

export class Markdown{

  @bindable markdown: string;
  @bindable document: string;
  @bindable url: string;
  private html = "";

  attached(): void {
    if (this.url) {
      axios.get(this.url)
        .then((response) => {
          if (response.data && response.data.length) {
            this.html = marked(response.data);
          }
        });
    } else if (this.document) {
      this.html = marked(this.document);
    } else if (this.markdown) {
      this.html = this.markdown;
    }
  }
}

export function initialize(domPurify: any): void {
  // const renderer = {
  //   link(href: string, title: string, text: string) {
  //     // return `<a href="${href}">${text} blossom</a>`;
  //     return `<a href="#" click="navigate()">${text} blossom</a>`;
  //   },
  // };

  // marked.use({ renderer });
  marked.setOptions({ gfm: true });

  // For temporarily saving original target value
  const TEMP_TARGET_ATTRIBUTE = "data-target-temp";

  domPurify.addHook("beforeSanitizeAttributes", function(node) {
    let targetValue;
    // Preserve default target attribute value
    if (node.tagName === "A") {
      targetValue = node.getAttribute("target");

      if (targetValue) {
        node.setAttribute(TEMP_TARGET_ATTRIBUTE, targetValue);
      }
      // else {
      //   // set default value
      //   node.setAttribute("target", "_self");
      // }
    }
  });

  domPurify.addHook("afterSanitizeAttributes", function(node) {
    if (node.tagName === "A" && node.hasAttribute(TEMP_TARGET_ATTRIBUTE)) {
      node.setAttribute("target", node.getAttribute(TEMP_TARGET_ATTRIBUTE));
      node.removeAttribute(TEMP_TARGET_ATTRIBUTE);

      // set `rel="noopener"` to prevent another security issue.
      if (node.getAttribute("target") === "_blank") {
        node.setAttribute("rel", "noopener noreferrer");
      }
    }
  });
}
