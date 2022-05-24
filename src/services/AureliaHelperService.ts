import { inject, IContainer, IDisposable } from "aurelia";
import { IObserverLocator, IObservable, ICollectionSubscriber } from "@aurelia/runtime";

@inject()
export class AureliaHelperService {

  constructor(
    public container: IContainer,
    private observerLocator: IObserverLocator,
  ) {
    //
  }

  /**
 * Make property bindable
 * @param object
 * @param propertyName
 */
  public makePropertyObservable(object: any, propertyName: string): void {
    this.observerLocator.getObserver(object, propertyName);
  }

  /**
   * Create an observable property and subscribe to changes
   * @param object
   * @param propertyName
   * @param func
   */
  public createPropertyWatch<T, Prop extends keyof T>(
    object: IObservable<T>,
    propertyName: Prop,
    func: (newValue: any, oldValue: any) => void,
  ): IDisposable {
    if (typeof propertyName !== "string") {
      throw new Error("String expected for property Watcher.");
    }

    const subscriber = {
      handleChange(newValue, oldValue): void {
        func(newValue, oldValue);
      }
    };
  
    return this.observerLocator.getObserver(object, propertyName)
      .subscribe(subscriber) as unknown as IDisposable;
  }

  /**
   * The callback will receive an array of splices which provides information about the change that was detcted.
   * The properties of the splice may vary depending on the type of collection being observed.
   * See for example: https://aurelia.io/docs/binding/observable-properties#observing-collections
   * @param collection
   * @param func handler
   */
  public createCollectionWatch(
    collection: unknown[],
    func: (splices: ICollectionSubscriber) => void
  ): IDisposable {

    const subscriber = {
      handleCollectionChange(splices): void {
        func(splices);
      }
    };

    return this.observerLocator.getArrayObserver(collection).subscribe(subscriber) as unknown as IDisposable;
  }

  // TODO: Is this still needed?
  // /**
  //  * bind the html element located by the path given by elementSelector.
  //  * @param elementSelector
  //  * @param bindingContext -- The viewmodel against which the binding should run
  //  */
  // public enhance(elementSelector: string, bindingContext: unknown): void {
  //   const el = document.querySelector(elementSelector);
  //   this.enhanceElement(el, bindingContext);

  // }

  // public enhanceElement(el: Element, bindingContext: unknown, reEnhance = false): void {
  //   if (el) {
  //     if (reEnhance) {
  //       el.classList.remove("au-target");
  //     }
  //     this.templatingEngine.enhance({ element: el, bindingContext });
  //   }
  // }
}
