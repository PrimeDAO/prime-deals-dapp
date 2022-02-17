import { autoinject } from "aurelia-framework";
import { Utils } from "services/utils";

export interface IDimensionRange {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

@autoinject
export class ImageService {
  private static imagesByUrls: Map<string, HTMLImageElement> = new Map();
  private static imagesDetailsByUrls: Map<string, {mimeType: string, fileSize: number}> = new Map();

  public static async getFileDetails(url: string): Promise<{mimeType: string, fileSize: number}> {
    if (this.imagesDetailsByUrls.has(url)) {
      return this.imagesDetailsByUrls.get(url);
    }

    return new Promise((resolve, reject) => {
      if (!Utils.isValidUrl(url)) {
        reject();
      }
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const fileSize = parseInt(xhr.getResponseHeader("Content-Length"), 10);
          const result = {
            mimeType: this.getMimeType(reader.result as string),
            fileSize,
          };
          this.imagesDetailsByUrls.set(url, result);
          resolve(result);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = () => {
        reject("corsError");
      };
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.send();
    });
  }

  public static getMimeType = (dataUrl: string) => {
    return dataUrl.substring(dataUrl.indexOf(":") + 1, dataUrl.indexOf(";"));
  };

  public static async getImageFromUrl(url: string): Promise<HTMLImageElement> {
    if (this.imagesByUrls.has(url)) {
      return this.imagesByUrls.get(url);
    }

    return await new Promise((resolve, reject) => {
      if (!Utils.isValidUrl(url)) {
        reject();
      }
      const timeout = 5000;
      const img = new Image();
      img.onerror = img.onabort = function () {
        clearTimeout(timer);
        reject();
      };
      img.onload = () => {
        clearTimeout(timer);
        this.imagesByUrls.set(url, img);
        resolve(img);
      };
      const timer = setTimeout(function () {
        // reset .src to invalid URL so it stops previous
        // loading, but doesn't trigger new load
        img.src = "";
        reject();
      }, timeout);
      img.src = url;
    });
  }

  public static async isImageUrl(url: string): Promise<boolean> {
    try {
      await this.getImageFromUrl(url);
      return true;
    } catch {
      return false;
    }
  }

  public static async validateImageSize(url: string, maxSize: number): Promise<boolean> {
    try {
      const fileDetails = await this.getFileDetails(url);
      if (fileDetails.fileSize > maxSize) {
        throw new Error();
      }
    } catch (error) {
      if (error === "corsError") {
        return true;
      }
      return false;
    }

    return true;
  }

  public static async isSquareImage(url: string): Promise<boolean> {
    try {
      const image = await this.getImageFromUrl(url);
      if (image.naturalWidth !== image.naturalHeight) {
        throw new Error();
      }
    } catch {
      return false;
    }

    return true;
  }

  public static async validateImageDimensions(url: string, dimensions: IDimensionRange): Promise<boolean> {
    try {
      const image = await this.getImageFromUrl(url);
      if (
        image.naturalWidth < dimensions.minWidth ||
        image.naturalWidth > dimensions.maxWidth ||
        image.naturalHeight < dimensions.minHeight ||
        image.naturalHeight > dimensions.maxHeight
      ) {
        throw new Error();
      }
    } catch {
      return false;
    }

    return true;
  }

  public static async validateImageExtension(url: string, extensions: string[]): Promise<boolean> {
    try {
      const fileDetails = await this.getFileDetails(url);
      if (
        extensions.map(item => item.toLowerCase())
          .indexOf(this.mimeTypeToExtension(fileDetails.mimeType)) === -1
      ) {
        throw new Error();
      }
    } catch (error) {
      if (error === "corsError") {
        return true;
      }
      return false;
    }

    return true;
  }

  public static mimeTypeToExtension(mimeType: string): string {
    switch (mimeType) {
      case "image/jpeg":
      case "image/pjpeg":
        return "jpg";

      case "image/png":
        return "png";

      case "image/gif":
        return "gif";

      case "image/bmp":
        return "bmp";

      default:
        break;
    }
  }
}
