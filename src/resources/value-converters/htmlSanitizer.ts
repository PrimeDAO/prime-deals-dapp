import { valueConverter } from "aurelia";

const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

/**
 * Default Html Sanitizer to prevent script injection.
 */

@valueConverter("sanitizeHTML")
export class HTMLSanitizer {
  /**
   * Sanitizes the provided input.
   * @param input The input to be sanitized.
   */
  sanitize(input) {
    return input.replace(SCRIPT_REGEX, "");
  }
}
