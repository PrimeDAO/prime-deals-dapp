import { Utils } from "services/utils";

describe("isLogoUrl", () => {
  it("is defined", () => {
    expect(Utils.isLogoUrl).toBeDefined();
  });

  it("return false if supplied argument is not a url", () => {
    expect(Utils.isLogoUrl("notUrl")).toEqual(false);
  });

  it("return false if url is not an image", () => {
    expect(Utils.isLogoUrl("https://example.com")).toEqual(false);
  });
});
