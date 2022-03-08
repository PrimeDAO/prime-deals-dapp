import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";
import * as corsLib from "cors";
import { getAddress } from "ethers/lib/utils";

const admin = firebaseAdmin.initializeApp();

// Allow cross-origin requests for functions which use it
// It is necessary to accept HTTP requests from our app,
// as firebase functions are not hosted on the same domain
const cors = corsLib({
  origin: true,
});

// creates a token that is used to sign in to firebase from the frontend
export const createCustomToken = functions.https.onRequest(
  (request, response) =>
    // Allow cross-origin requests for this function
    cors(request, response, async () => {
      if (request.method !== "POST") {
        return response.sendStatus(403);
      }

      if (!request.body.address) {
        return response.sendStatus(400);
      }

      const address = request.body.address;

      // Fail if provided address is not an ethereum address
      try {
        getAddress(address);
      } catch {
        return response.sendStatus(500);
      }

      try {
        const firebaseToken = await admin.auth().createCustomToken(address);

        return response.status(200).json({ token: firebaseToken });
      } catch (error){
        functions.logger.error("createCustomToken error:", error);
        return response.sendStatus(500);
      }
    }),
);
