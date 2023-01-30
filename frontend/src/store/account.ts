import { defineStore } from "pinia";
import axios from "axios";
import { accountStatus, Skin, Store, StoreSkin } from "@/models";

import { Storage } from "@ionic/storage";
const store = new Storage();
store.create();

export const useAccountStore = defineStore("accountStore", {
  state: () => ({ accountStatus: accountStatus.notLoggedIn }),
  getters: {
    isLoggedIn: (state) => state.accountStatus == accountStatus.loggedIn,
  },
  actions: {
    async tryReauth(): Promise<boolean> {
      const apiClient = await store.get("APIClient");
      if (apiClient) {
        try {
          const res = await axios.post(
            import.meta.env.VITE_BACKEND_URL + "/reauth",
            {
              APIClient: apiClient,
            }
          );
          if (res.status == 200) {
            await store.set("APIClient", res.data);
            this.accountStatus = accountStatus.loggedIn;
            return true;
          } else {
            this.accountStatus = accountStatus.notLoggedIn;
          }
        } catch (error) {
          console.error("API Client Reauth", error);
        }
      }
      return false;
    },
    async signInUser(username: string, password: string, region: string) {
      try {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL + "/auth",
          {
            username: username,
            password: password,
            region: region,
          }
        );
        if (res.status == 200) {
          await store.set("APIClient", res.data);
          this.accountStatus = accountStatus.loggedIn;
        } else if (res.status == 202) {
          await store.set("APIClient", res.data);
          this.accountStatus = accountStatus.needsMFA;
        } else {
          this.accountStatus = accountStatus.notLoggedIn;
        }
      } catch (error: any) {
        this.accountStatus = accountStatus.notLoggedIn;
        console.error(
          "Error logging in:",
          error.toJSON().toString(),
          "url:",
          import.meta.env.VITE_BACKEND_URL + "/auth"
        );
      }
    },
    async submitMFA(code: string) {
      const apiClient = await store.get("APIClient");
      if (apiClient) {
        try {
          const res = await axios.post(
            import.meta.env.VITE_BACKEND_URL + "/mfa",
            {
              code: code,
              APIClient: apiClient,
            }
          );
          if (res.status == 200) {
            await store.set("APIClient", res.data);
            this.accountStatus = accountStatus.loggedIn;
          } else if (res.status == 202) {
            await store.set("APIClient", res.data);
            this.accountStatus = accountStatus.needsMFA;
          } else {
            this.accountStatus = accountStatus.notLoggedIn;
          }
        } catch (error) {
          this.accountStatus = accountStatus.notLoggedIn;
          console.error("Error submitting MFA", error);
        }
      }
    },
    async signoutUser() {
      await store.remove("APIClient");
      this.accountStatus = accountStatus.notLoggedIn;
    },
    async markSignedOut() {
      this.accountStatus = accountStatus.notLoggedIn;
    },
    async getStore(): Promise<Store> {
      try {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL + "/store",
          {
            APIClient: await store.get("APIClient"),
          }
        );
        if (res.status == 200) {
          return res.data;
        }
      } catch (error) {
        console.error("Error getting store", error);
      }
      return { bundles: [], skins: [], remainingTime: 0 };
    },
    async addWishlistItem(item: string, token: string): Promise<StoreSkin[]> {
      try {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL + "/wishlist/add",
          {
            APIClient: await store.get("APIClient"),
            skinId: item,
            token: token,
          }
        );
        if (res.status == 200) {
          return res.data;
        }
      } catch (error) {
        console.error("Error adding wishlist item", error);
      }
      return [];
    },
    async removeWishlistItem(item: string): Promise<StoreSkin[]> {
      try {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL + "/wishlist/remove",
          {
            APIClient: await store.get("APIClient"),
            skinId: item,
          }
        );
        if (res.status == 200) {
          return res.data;
        }
      } catch (error) {
        console.error("Error removing wishlist item", error);
      }
      return [];
    },
    async getWishlist(): Promise<StoreSkin[]> {
      try {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL + "/wishlist",
          {
            APIClient: await store.get("APIClient"),
          }
        );
        if (res.status == 200) {
          return res.data;
        }
      } catch (error) {
        console.error("Error getting wishlist", error);
      }
      return [];
    },
  },
});
