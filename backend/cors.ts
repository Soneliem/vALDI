import { VercelRequest, VercelResponse } from "@vercel/node";

export const allowCors =
  (fn) => async (req: VercelRequest, res: VercelResponse) => {
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
