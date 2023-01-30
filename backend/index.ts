require("dotenv").config();
import client from "@valapi/web-client";
import ValAPI from "@valapi/valorant-api.com";
import express from "express";
import cors from "cors";
import { Bundle, Skin, Store, dbUser } from "./models";
import { User } from "./db";
import schedule from "node-schedule";
var admin = require("firebase-admin");
import { getMessaging } from "firebase-admin/messaging";

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
  if (req.body?.APIClient) {
    const apiClient = client.fromJSON(req.body.APIClient);
    const valAPI = new ValAPI({});
    const dbUser = await User.findOne({
      where: {
        id: apiClient.getSubject(),
      },
    });
    if (!dbUser) {
      return res.status(404).json("User not found.");
    }
    const [offers, apiSkins] = await Promise.all([
      apiClient.Store.getOffers(),
      valAPI.Weapons.getSkins(),
    ]);
    const skins = await skinIdsToSkins(
      dbUser.skins,
      offers.data.Offers,
      apiSkins.data.data
    );
    return res.send(skins);
  } else {
    return res.status(400).json("API Client is required.");
  }
});

app.post("/wishlist/add", async function (req, res, next) {
  if (req.body?.APIClient && req.body?.skinId && req.body?.token) {
    const apiClient = client.fromJSON(req.body?.APIClient);
    const valAPI = new ValAPI({});

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
      const [offers, apiSkins] = await Promise.all([
        apiClient.Store.getOffers(),
        valAPI.Weapons.getSkins(),
      ]);
      const cSkins = await skinIdsToSkins(
        dbUser.skins,
        offers.data.Offers,
        apiSkins.data.data
      );
      return res.send(cSkins);
    }
  } else {
    return res.status(400).json("API Client, skinID and token are required.");
  }
});

app.post("/wishlist/remove", async function (req, res, next) {
  if (req.body?.APIClient && req.body?.skinId) {
    const apiClient = client.fromJSON(req.body?.APIClient);
    const valAPI = new ValAPI({});
    const userId = apiClient.getSubject();
    const dbUser = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (dbUser) {
      const skins = dbUser.skins;
      const index = skins.indexOf(req.body?.skinId as string);
      if (index > -1) {
        skins.splice(index, 1);

        if (skins.length === 0) {
          await User.destroy({
            where: {
              id: userId,
            },
          });
        } else {
          await User.update(
            {
              skins: skins,
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
      const [offers, apiSkins] = await Promise.all([
        apiClient.Store.getOffers(),
        valAPI.Weapons.getSkins(),
      ]);
      const cSkins = await skinIdsToSkins(
        dbUser.skins,
        offers.data.Offers,
        apiSkins.data.data
      );
      return res.send(cSkins);
    } else {
      return [];
    }
  } else {
    return res.status(400).json("API Client and skinID are required.");
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

    const skins = await skinIdsToSkins(
      rawStore.data.SkinsPanelLayout.SingleItemOffers,
      offers.data.Offers,
      apiSkins.data.data
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

const server = app.listen(8080, function () {
  console.log("Web server listening on port", 8080);
});

server.setTimeout(10000);

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_JSON as string)
  ),
});

async function checkAndNotifyStore() {
  User.findAll().then(async (users: dbUser[]) => {
    await Promise.all(
      users.map(async (user: dbUser) => {
        if (!user.notify) return;
        const apiClient = client.fromJSON(user.client);
        await apiClient.refresh();
        const valAPI = new ValAPI({});
        const [rawStore, offers, apiSkins] = await Promise.all([
          apiClient.Store.getStorefront(apiClient.getSubject()),
          apiClient.Store.getOffers(),
          valAPI.Weapons.getSkinLevels(),
        ]);

        if (!rawStore?.data?.SkinsPanelLayout?.SingleItemOffers) return;

        const skins = await skinIdsToSkins(
          rawStore.data.SkinsPanelLayout.SingleItemOffers,
          offers.data.Offers,
          apiSkins.data.data
        );

        if (skins.length > 0) {
          const newSkinsString = skins
            .map((skin) => skin.name)
            .join(", ")
            .replace(/,(?!.*,)/gim, " and");

          getMessaging()
            .sendMulticast({
              notification: {
                title: "VALDI: Daily Store",
                body: `The following skins are now available in your store: ${newSkinsString}!`,
              },
              tokens: user.tokens,
              android: {
                notification: {
                  icon: "https://valdi.sonel.dev/assets/icon/favicon.png",
                },
              },

              webpush: {
                notification: {
                  icon: "https://valdi.sonel.dev/assets/icon/favicon.png",
                },
                fcmOptions: {
                  link: "https://valdi.sonel.dev/store",
                },
              },
            })
            .catch((error) => {
              console.error("Error sending message:", error);
            });
        }
      })
    );
  });
}

async function skinIdsToSkins(skins: string[], offers: any, apiSkins: any) {
  return await Promise.all(
    skins.map(async (rawSkin: string) => {
      // Get the skin info from ValAPI
      const skinData = apiSkins.find((skin: any) => skin.uuid === rawSkin);
      // Get the skin price from the Offers endpoint
      const offer = offers.find((offer: any) => offer.OfferID === rawSkin);
      let price = 0;
      if (offer) {
        price = offers.find((offer: any) => offer.OfferID === rawSkin).Cost[
          "85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"
        ];
      }
      return <Skin>{
        uuid: rawSkin,
        name: skinData?.displayName,
        image: skinData?.displayIcon,
        price: price,
      };
    })
  );
}

schedule.scheduleJob("1 0 * * *", async () => {
  await checkAndNotifyStore();
});

process.on("uncaughtException", function (err) {
  console.error(err);
});
