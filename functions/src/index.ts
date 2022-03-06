import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";
import * as corsLib from "cors";

const admin = firebaseAdmin.initializeApp();

const cors = corsLib({
  origin: true,
});

export const createCustomToken = functions.https.onRequest(
  (request, response) =>
    cors(request, response, async () => {
      if (request.method !== "POST") {
        return response.sendStatus(403);
      }

      if (!request.body.address) {
        return response.sendStatus(400);
      }

      // @TODO check if it is a correct eth address

      try {
        const address = request.body.address;
        const firebaseToken = await admin.auth().createCustomToken(address);

        return response.status(200).json({ token: firebaseToken });
      } catch {
        return response.sendStatus(500);
      }
    }),
);
