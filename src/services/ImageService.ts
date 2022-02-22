import { autoinject } from "aurelia-framework";
import axios from "axios";
import { Utils } from "services/utils";

export interface IDimensionRange {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

const mimeTypeToExtension = {
  "image/jpeg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/bmp": "bmp",
};

const extensionToMimeType = {
  "png": "image/png",
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "gif": "image/gif",
  "bmp": "image/bmp",
};

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
        return reject("Invalid URL");
      }
      axios({
        url,
        method: "GET",
        responseType: "blob",
      }).then((response) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const fileSize = parseInt(response.headers["content-length"], 10);
          const result = {
            mimeType: this.getMimeType(reader.result as string),
            fileSize,
          };
          this.imagesDetailsByUrls.set(url, result);
          resolve(result);
        };
        reader.readAsDataURL(response.data);
      }).catch(() => {
        const imageUrl = new URL(url);
        const mimeType = extensionToMimeType[imageUrl.pathname.substring(imageUrl.pathname.lastIndexOf(".") + 1)];
        resolve({
          mimeType,
          fileSize: null,
        });
      });
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
        return reject("Invalid URL");
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
        throw new Error("File size is too big");
      }
    } catch (error) {
      return false;
    }

    return true;
  }

  public static async isSquareImage(url: string): Promise<boolean> {
    try {
      const image = await this.getImageFromUrl(url);
      if (image.naturalWidth !== image.naturalHeight) {
        throw new Error("Image is not squared.");
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
        throw new Error("Incorrect image dimensions");
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
          .indexOf(mimeTypeToExtension[fileDetails.mimeType]) === -1
      ) {
        throw new Error("Incorrect mimeType");
      }
    } catch (error) {
      return false;
    }

    return true;
  }
}
