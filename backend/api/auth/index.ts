import { Client } from "@valapi/web-client";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { allowCors } from "../../cors";

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "POST") {
    if (req.body?.username && req.body?.password && req.body?.region) {
      const ApiClient = new Client({ region: req.body.region });
      await ApiClient.login(req.body.username, req.body.password);
      if (ApiClient.isMultifactor) {
        return res.status(511).send(ApiClient.toJSON());
      }
      return res.send(ApiClient.toJSON());
    } else {
      return res
        .status(400)
        .json("Username, password, and region are required.");
    }
  }
};

module.exports = allowCors(handler);
