require("dotenv").config();
import client from "@valapi/web-client";
import ValAPI from "@valapi/valorant-api.com";
import express from "express";
import cors from "cors";
import { Bundle, Skin, Store } from "./models";
import { User } from "./db";

const app = express();

var allowlist = [
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost",
  "http://localhost:8080",
  "http://localhost:8100",
  "https://valdi.sonel.dev",
  "http://valdi.sonel.dev",
  "https://valdi-staging.sonel.dev",
  "http://valdi-staging.sonel.dev",
  "valdi-soneliem.vercel.app",
];

const options: cors.CorsOptions = {
  origin: allowlist,
  optionsSuccessStatus: 200,
};

app.use(cors(options));
app.use(express.json());
app.options("*", cors(options));

app.post("/auth", async function (req, res, next) {
  if (req.body?.username && req.body?.password && req.body?.region) {
    const apiClient = new client({ region: req.body.region });
    await apiClient.login(req.body.username, req.body.password);
    if (apiClient.isMultifactorAccount) {
      return res.status(202).send(apiClient.toJSON());
    }
    return res.send(apiClient.toJSON());
  } else {
    return res.status(400).json("Username, password, and region are required.");
  }
});

app.post("/mfa", async function (req, res, next) {
  if (req.body?.APIClient && req.body?.code) {
    const apiClient = client.fromJSON(req.body.APIClient);
    await apiClient.verify(req.body.code);

    return res.send(apiClient.toJSON());
  } else {
    return res.status(400).json("API Client and MFA code is required.");
  }
});

app.post("/wishlist", async function (req, res, next) {
  if (req.body?.APIClient && req.body?.skinId && req.body?.token) {
    const apiClient = client.fromJSON(req.body?.APIClient);
    const userId = apiClient.getSubject();
    const dbUser = await User.findOne({
      where: {
        id: apiClient.getSubject(),
      },
    });
    if (!dbUser) {
      await User.create({
        id: userId,
        client: apiClient.toJSON(),
        skins: [req.body?.skinId as string],
        tokens: [req.body?.token as string],
      });
    } else {
      const skins = dbUser.skins;
      if (!skins.includes(req.body?.skinId as string)) {
        skins.push(req.body?.skinId as string);
        const tokens = dbUser.tokens;
        if (!tokens.includes(req.body?.token as string)) {
          tokens.push(req.body?.token as string);
        }

        await User.update(
          {
            skins: skins,
            tokens: tokens,
            client: apiClient.toJSON(),
          },
          {
            where: {
              id: userId,
            },
          }
        );
      }
    }
  } else {
    return res.status(400).json("API Client, skinID and token are required.");
  }
});

app.post("/reauth", async function (req, res, next) {
  if (req.body?.APIClient) {
    const apiClient = client.fromJSON(req.body?.APIClient);
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
    const apiClient = client.fromJSON(req.body?.APIClient);
    const valAPI = new ValAPI({});
    // Get store, offers and skin info
    const [rawStore, offers, apiSkins, apiBundles] = await Promise.all([
      apiClient.Store.getStorefront(apiClient.getSubject()),
      apiClient.Store.getOffers(),
      valAPI.Weapons.getSkinLevels(),
      valAPI.Bundles.get(),
    ]);

    if (!rawStore?.data?.SkinsPanelLayout?.SingleItemOffers)
      return res.status(400).json("Store is not available.");

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
