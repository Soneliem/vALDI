import { Client } from "@valapi/web-client";
import express from "express";
import cors from "cors";
const app = express();

var allowlist = [
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost",
  "http://localhost:8080",
  "http://localhost:8100",
];
const options: cors.CorsOptions = {
  origin: allowlist,
};

app.use(cors(options));
app.use(express.json());
app.options("*", cors());

app.post("/auth", async function (req, res, next) {
  if (req.body?.username && req.body?.password && req.body?.region) {
    const ApiClient = new Client({ region: req.body.region });
    await ApiClient.login(req.body.username, req.body.password);
    if (ApiClient.isMultifactor) {
      res.status(511).send(ApiClient.toJSON());
    }
    res.send(ApiClient.toJSON());
  } else {
    res.status(400).json("Username, password, and region are required.");
  }
});

app.get("/store", async function (req, res, next) {
  if (req.body?.APIClient) {
    const ApiClient = Client.fromJSON(req.body?.APIClient);
    res.send(
      await ApiClient.Store.getStorefront(
        await (
          await ApiClient.Player.getUserInfo()
        ).data.sub
      )
    );
  } else {
    res.status(400).json("API Client is required.");
  }
});

app.listen(8080, function () {
  console.log("Web server listening on port", 8080);
});
