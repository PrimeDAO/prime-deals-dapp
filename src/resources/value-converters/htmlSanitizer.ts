import DOMPurify from "dompurify";
import { valueConverter, inject } from "aurelia";

/**
 * Html Sanitizer to prevent script injection.
 */
@inject()
@valueConverter("sanitizeHTML")
export class HTMLSanitizer {

  constructor(
    private domPurify: DOMPurify,
  ) {
  }

  toView(input: string): string {
    return this.domPurify.sanitize(input, { USE_PROFILES: { html: true } });
  }
}
