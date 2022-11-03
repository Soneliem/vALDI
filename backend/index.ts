import { Client as WebClient } from "@valapi/web-client";
import { Client as ValAPI } from "@valapi/valorant-api.com";
import express from "express";
import cors from "cors";
import { Bundle, Skin, Store } from "./models";
const app = express();

var allowlist = [
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost",
  "http://localhost:8080",
  "http://localhost:8100",
  "https://valdi.sonel.dev",
  "valdi-soneliem.vercel.app",
];
const options: cors.CorsOptions = {
  origin: allowlist,
};

app.use(cors(options));
app.use(express.json());
app.options("*", cors());

app.post("/auth", async function (req, res, next) {
  if (req.body?.username && req.body?.password && req.body?.region) {
    const apiClient = new WebClient({ region: req.body.region });
    await apiClient.login(req.body.username, req.body.password);
    if (apiClient.isMultifactor) {
      res.status(511).send(apiClient.toJSON());
    }
    res.send(apiClient.toJSON());
  } else {
    res.status(400).json("Username, password, and region are required.");
  }
});

app.post("/reauth", async function (req, res, next) {
  if (req.body?.APIClient) {
    const apiClient = WebClient.fromJSON(req.body?.APIClient);
    try {
      await apiClient.refresh();
    } catch (e) {
      await apiClient.fromCookie(apiClient.toJSON().cookie.ssid);
    }
    res.send(apiClient.toJSON());
  } else {
    res.status(400).json("API Client is required.");
  }
});

app.post("/store", async function (req, res, next) {
  if (req.body?.APIClient) {
    const apiClient = WebClient.fromJSON(req.body?.APIClient);
    const valAPI = new ValAPI({});
    // Get store, offers and skin info
    const [rawStore, offers, apiSkins, apiBundles] = await Promise.all([
      apiClient.Store.getStorefront(
        await (
          await apiClient.Player.getUserInfo()
        ).data.sub
      ),
      apiClient.Store.getOffers(),
      valAPI.Weapons.getSkinLevels(),
      valAPI.Bundles.get(),
    ]);

    // Iterate through the store for normal skins
    const skins: Skin[] = await Promise.all(
      rawStore.data.SkinsPanelLayout.SingleItemOffers.map(
        async (rawSkin: string) => {
          // Get the skin info from ValAPI
          const skinData = apiSkins.data.data?.find(
            (skin) => skin.uuid === rawSkin
          );
          // Get the skin price from the Offers endpoint
          const price = offers.data.Offers.find(
            (offer: any) => offer.OfferID === rawSkin
          ).Cost["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"];
          return <Skin>{
            name: skinData?.displayName,
            image: skinData?.displayIcon,
            price: price,
          };
        }
      )
    );

    const bundles: Bundle[] = await Promise.all(
      rawStore.data.FeaturedBundle.Bundles.map(async (rawBundle: any) => {
        // Get the bundle info from ValAPI
        const bundleData = apiBundles.data.data?.find(
          (bundle) => bundle.uuid === rawBundle.DataAssetID
        );
        const price = rawBundle.Items.reduce(
          (accumulator: number, item: any) => {
            return accumulator + item.DiscountedPrice;
          },
          0
        );
        return <Bundle>{
          name: bundleData?.displayName,
          image: bundleData?.displayIcon,
          price: price,
          remainingTime: rawBundle.DurationRemainingInSeconds,
        };
      })
    );

    res.send(<Store>{
      bundles: bundles,
      skins: skins,
      remainingTime:
        rawStore.data.SkinsPanelLayout
          .SingleItemOffersRemainingDurationInSeconds,
    });
  } else {
    res.status(400).json("API Client is required.");
  }
});

app.listen(8080, function () {
  console.log("Web server listening on port", 8080);
});
