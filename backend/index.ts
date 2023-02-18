require("dotenv").config();
import client from "@valapi/web-client";
import ValAPI from "@valapi/valorant-api.com";
import { Weapons } from "@valapi/valorant-api.com/dist/service/Weapons";
import { Bundles } from "@valapi/valorant-api.com/dist/service/Bundles";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import {
  Bundle,
  Skin,
  Store,
  dbUser,
  StoreOffer,
  Account,
  MightmarketOffer,
  NightSkin,
} from "./models";
import { User } from "./db";
import schedule from "node-schedule";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
var admin = require("firebase-admin");
import { getMessaging } from "firebase-admin/messaging";
import NodeCache from "node-cache";
import rateLimit from "express-rate-limit";

const cache = new NodeCache();
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

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors(options));
app.use(express.json());
app.use(compression());
app.use(limiter);
app.options("*", cors(options));
app.disable("x-powered-by");
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  environment: process.env.ENVIRONMENT,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.post("/auth", async function (req, res) {
  if (req.body?.username && req.body?.password && req.body?.region) {
    const apiClient: client = new client({ region: req.body.region });
    await apiClient.login(req.body.username, req.body.password);
    if (apiClient.isMultifactorAccount) {
      return res.status(202).send(apiClient.toJSON());
    }
    return res.send(apiClient.toJSON());
  } else {
    return res.status(400).json("Username, password, and region are required.");
  }
});

app.post("/mfa", async function (req, res) {
  if (req.body?.APIClient && req.body?.code) {
    const apiClient = client.fromJSON(req.body.APIClient);
    await apiClient.verify(req.body.code);

    return res.send(apiClient.toJSON());
  } else {
    return res.status(400).json("API Client and MFA code is required.");
  }
});

app.post("/account", async function (req, res) {
  if (req.body?.APIClient) {
    const apiClient = client.fromJSON(req.body.APIClient);
    await apiClient.refresh();
    const uuid = apiClient.getSubject();
    const dbUser = await User.findOne({
      where: {
        id: uuid,
      },
    });
    let functions: any[] = [
      apiClient.Store.getWallet(uuid),
      apiClient.getUserInfo(),
      apiClient.AccountXP.getPlayer(uuid),
    ];

    if (dbUser)
      functions = functions.concat([
        apiClient.Store.getOffers(),
        getAllSkins(),
      ]);

    const results = await Promise.all(functions);

    try {
      const user = <Account>{
        user: {
          username:
            results[1].data.acct.game_name +
            "#" +
            results[1].data.acct.tag_line,
          level: results[2].data.Progress.Level,
        },
        wallet: {
          vp: results[0].data.Balances["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"],
          rp: results[0].data.Balances["e59aa87c-4cbf-517a-5983-6e81511be9b7"],
        },
        skins: [],
        notify: false,
      };

      if (dbUser) {
        const skins = await skinIdsToSkins(
          dbUser.skins,
          results[3].data.Offers,
          results[4]
        );
        user.skins = skins;
        user.notify = dbUser.notify;
      }

      return res.send(user);
    } catch (e) {
      return res.status(401).json("Getting account failed");
    }
  } else {
    return res.status(400).json("API Client is required.");
  }
});

app.post("/wishlist", async function (req, res) {
  if (req.body?.APIClient) {
    const apiClient = client.fromJSON(req.body.APIClient);
    await apiClient.refresh();
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
      getAllSkins(),
    ]);
    const skins = await skinIdsToSkins(
      dbUser.skins,
      offers.data.Offers,
      apiSkins
    );
    return res.send(skins);
  } else {
    return res.status(400).json("API Client is required.");
  }
});

app.get("/skins", async function (req, res) {
  return res.send(await getAllSkins());
});

app.post("/wishlist/add", async function (req, res) {
  if (req.body?.APIClient && req.body?.skinId && req.body?.token) {
    const apiClient = client.fromJSON(req.body?.APIClient);
    await apiClient.refresh();
    const userId = apiClient.getSubject();
    const dbUser = await User.findOne({
      where: {
        id: userId,
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
        getAllSkins(),
      ]);
      const cSkins = await skinIdsToSkins(
        dbUser.skins,
        offers.data.Offers,
        apiSkins
      );
      return res.send(cSkins);
    }
  } else {
    return res.status(400).json("API Client, skinID and token are required.");
  }
});

app.post("/wishlist/remove", async function (req, res) {
  if (req.body?.APIClient && req.body?.skinId) {
    const apiClient = client.fromJSON(req.body?.APIClient);
    await apiClient.refresh();
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

        if (skins.length == 0 && !dbUser.notify) {
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
        getAllSkins(),
      ]);
      const cSkins = await skinIdsToSkins(
        dbUser.skins,
        offers.data.Offers,
        apiSkins
      );
      return res.send(cSkins);
    } else {
      return [];
    }
  } else {
    return res.status(400).json("API Client and skinID are required.");
  }
});

app.post("/reauth", async function (req, res) {
  if (req.body?.APIClient) {
    const apiClient = client.fromJSON(req.body?.APIClient);
    await apiClient.refresh();
    if (apiClient.isAuthenticationError) {
      return res.status(401).json("Reauth Failed");
    }
    res.send(apiClient.toJSON());
  } else {
    res.status(400).json("API Client is required.");
  }
});

app.post("/notify/enable", async function (req, res) {
  if (req.body?.APIClient && req.body?.token) {
    const apiClient = client.fromJSON(req.body?.APIClient);
    await apiClient.refresh();
    const userId = apiClient.getSubject();
    const dbUser = await User.findOne({
      where: {
        id: userId,
      },
    });
    if (!dbUser) {
      await User.create({
        id: userId,
        client: apiClient.toJSON(),
        notify: true,
        tokens: [req.body?.token as string],
      });
    } else {
      const tokens = dbUser.tokens;
      if (!dbUser.tokens.includes(req.body?.token as string)) {
        tokens.push(req.body?.token as string);
      }
      await User.update(
        {
          tokens: tokens,
          notify: true,
          client: apiClient.toJSON(),
        },
        {
          where: {
            id: userId,
          },
        }
      );
    }
    res.send();
  } else {
    res.status(400).json("API Client is required.");
  }
});

app.post("/notify/disable", async function (req, res) {
  if (req.body?.APIClient) {
    const apiClient = client.fromJSON(req.body?.APIClient);
    await apiClient.refresh();
    const userId = apiClient.getSubject();
    const dbUser = await User.findOne({
      where: {
        id: userId,
      },
    });
    if (dbUser.skins.length) {
      await User.update(
        {
          notify: false,
          client: apiClient.toJSON(),
        },
        {
          where: {
            id: userId,
          },
        }
      );
    } else {
      await User.destroy({
        where: {
          id: userId,
        },
      });
    }

    res.send();
  } else {
    res.status(400).json("API Client is required.");
  }
});

app.post("/store", async function (req, res) {
  if (req.body?.APIClient) {
    const apiClient = client.fromJSON(req.body?.APIClient);
    await apiClient.refresh();
    // Get store, offers and skin info
    const [rawStore, apiSkins, apiBundles] = await Promise.all([
      apiClient.Store.getStorefront(apiClient.getSubject()),
      getAllSkins(),
      getBundles(),
    ]);

    if (!rawStore?.data?.SkinsPanelLayout?.SingleItemStoreOffers)
      return res.status(400).json("Store is not available.");

    const skins = await storeToSkins(
      rawStore?.data?.SkinsPanelLayout?.SingleItemStoreOffers,
      apiSkins
    );

    const store: Store = {
      bundles: [],
      skins: skins,
      remainingTime:
        rawStore.data.SkinsPanelLayout
          .SingleItemOffersRemainingDurationInSeconds,
    };

    // TODO: Implement nightmarket

    if (rawStore?.data?.BonusStore) {
      const bonusSkins = await nightStoreToSkins(
        rawStore?.data?.BonusStore?.BonusStoreOffers,
        apiSkins
      );
      store.nightMarket = bonusSkins;
    }

    if (apiBundles) {
      store.bundles = await Promise.all(
        rawStore.data.FeaturedBundle.Bundles.map(async (rawBundle: any) => {
          // Get the bundle info from ValAPI
          const bundleData = apiBundles.find(
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
    }
    res.send(store);
  } else {
    res.status(400).json("API Client is required.");
  }
});

app.use(Sentry.Handlers.errorHandler());

const server = app.listen(8080, function () {
  console.log("Web server listening on port", 8080);
});

server.setTimeout(10000);

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n")
        : undefined,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }),
  });
} catch (e) {
  reportError("Error initialising firebase:", e);
}

async function checkAndNotifyStore() {
  User.findAll().then(async (users: dbUser[]) => {
    await Promise.all(
      users.map(async (user: dbUser) => {
        const apiClient = client.fromJSON(user.client);
        await apiClient.refresh();
        const [rawStore, apiSkins] = await Promise.all([
          apiClient.Store.getStorefront(apiClient.getSubject()),
          getAllSkins(),
        ]);

        if (!rawStore?.data?.SkinsPanelLayout?.SingleItemStoreOffers) {
          sendMessage(
            "VALDI",
            "Could not check your store, sign in to reauthenticate",
            user.tokens
          );
        }

        const foundSkins: StoreOffer[] = [];
        user.skins.forEach((skin) => {
          const apiSkin =
            rawStore.data.SkinsPanelLayout.SingleItemStoreOffers.find(
              (s: StoreOffer) => s.OfferID == skin
            );
          if (apiSkin) foundSkins.push(apiSkin);
        });

        if (foundSkins.length > 0) {
          const skins = await storeToSkins(foundSkins, apiSkins);

          const newSkinsString = skins
            .map((skin) => skin.name)
            .join(", ")
            .replace(/,(?!.*,)/gim, " and");

          let message = `Your wishlisted skin, ${newSkinsString}, is your store!`;

          if (skins.length > 1)
            message = `Your wishlisted skins, ${newSkinsString}, are your store!`;

          sendMessage("VALDI: RIP Your Wallet", message, user.tokens);
        }

        if (user.notify) {
          const skins = await storeToSkins(
            rawStore.data.SkinsPanelLayout.SingleItemStoreOffers,
            apiSkins
          );

          const newSkinsString = skins
            .map((skin) => skin.name)
            .join(", ")
            .replace(/,(?!.*,)/gim, " and");

          sendMessage(
            "VALDI: Daily Store",
            `The following skins are now available in your store: ${newSkinsString}!`,
            user.tokens
          );
        }
      })
    );
  });
}

async function sendMessage(
  title: string,
  message: string,
  tokens: string[],
  link?: string
) {
  await getMessaging()
    .sendMulticast({
      notification: {
        title: title,
        body: message,
      },
      tokens: tokens,
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
          link: link,
        },
      },
    })
    .catch((error) => {
      reportError("Error sending message:", error);
    });
}

async function skinIdsToSkins(skins: string[], offers: any[], apiSkins: any) {
  return await Promise.all(
    skins.map(async (rawSkin: string) => {
      const skinData = apiSkins.find((skin: any) => skin.uuid === rawSkin);
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

async function storeToSkins(
  store: StoreOffer[],
  apiSkins: Weapons.WeaponSkinLevels[]
) {
  return await Promise.all(
    store.map(async (rawSkin: StoreOffer) => {
      const skinData = apiSkins.find(
        (skin: any) => skin.uuid === rawSkin.OfferID
      );
      return <Skin>{
        uuid: rawSkin.OfferID,
        name: skinData?.displayName,
        image: skinData?.displayIcon,
        price: rawSkin.Cost["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"],
      };
    })
  );
}

async function nightStoreToSkins(
  store: MightmarketOffer[],
  apiSkins: Weapons.WeaponSkinLevels[]
) {
  return await Promise.all(
    store.map(async (rawSkin: MightmarketOffer) => {
      const skinData = apiSkins.find(
        (skin: any) => skin.uuid === rawSkin.Offer.OfferID
      );
      return <NightSkin>{
        uuid: rawSkin.Offer.OfferID,
        name: skinData?.displayName,
        image: skinData?.displayIcon,
        price: rawSkin.DiscountCosts["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"],
        originalPrice:
          rawSkin.Offer.Cost["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"],
        discount: rawSkin.DiscountPercent,
      };
    })
  );
}

async function getAllSkins() {
  if (cache.has("skins"))
    return cache.get("skins") as Weapons.WeaponSkinLevels[];
  const valAPI = new ValAPI();
  const lowestLevelSkins: Weapons.WeaponSkinLevels[] = [];
  const res = await valAPI.Weapons.getSkins();
  if (!res.data?.data) return [];
  await Promise.all(
    res.data.data.map(async (skin) => {
      lowestLevelSkins.push(skin.levels[0]);
    })
  );
  cache.set("skins", lowestLevelSkins, 432000);
  return lowestLevelSkins;
}

async function getBundles() {
  if (cache.has("bundles")) return cache.get("bundles") as Bundles.Bundles[];
  const valAPI = new ValAPI();
  const res = await valAPI.Bundles.get();
  if (!res.data?.data) return [];
  cache.set("bundles", res.data.data, 86400);
  return res.data.data;
}

if (process.env.ENVIRONMENT !== "STAGING") {
  schedule.scheduleJob("1 0 * * *", async () => {
    await checkAndNotifyStore();
  });
}

function reportError(msg: string, err: any) {
  console.error(msg, err);
  Sentry.captureException(err);
}
