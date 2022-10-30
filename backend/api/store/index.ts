import { Client } from "@valapi/web-client";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { allowCors } from "../../cors";

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "POST") {
    if (req.body?.APIClient) {
      const ApiClient = Client.fromJSON(req.body?.APIClient);
      return res.send(
        await ApiClient.Store.getStorefront(
          await (
            await ApiClient.Player.getUserInfo()
          ).data.sub
        )
      );
    }
  } else {
    return res.status(400).json("API Client is required.");
  }
};

module.exports = allowCors(handler);
