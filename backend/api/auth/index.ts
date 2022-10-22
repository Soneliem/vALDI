import { Client } from "@valapi/web-client";
import { VercelRequest, VercelResponse } from "@vercel/node";

const allowCors = (fn) => async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  const corsWhitelist = [
    "capacitor://localhost",
    "ionic://localhost",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:8100",
  ];
  if (req.headers.origin && corsWhitelist.includes(req.headers.origin)) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  }
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  return await fn(req, res);
};

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
