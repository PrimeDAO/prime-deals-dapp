import { autoinject } from "aurelia-framework";
import { FirebaseService } from "./../../services/FirebaseService";

@autoinject
export class FirebasePlayground {
  constructor(private firebaseService: FirebaseService) {}

  attached() {
    this.firebaseService.add();
  }
}
