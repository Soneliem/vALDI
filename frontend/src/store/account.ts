import { defineStore } from "pinia";
import axios from "axios";
import { accountStatus, Store } from "@/models";

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
        } else if (res.status == 205) {
          await store.set("APIClient", res.data);
          this.accountStatus = accountStatus.needsMFA;
        } else {
          this.accountStatus = accountStatus.notLoggedIn;
        }
      } catch (error: any) {
        this.accountStatus = accountStatus.notLoggedIn;
        console.error("Error logging in:", error.toString());
      }
    },
    async submitMFA(code: string) {
      try {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL + "/auth/mfa",
          {
            code: code,
            APIClient: await store.get("APIClient"),
          }
        );
        if (res.status == 200) {
          await store.set("APIClient", res.data);
          this.accountStatus = accountStatus.loggedIn;
        } else if (res.status == 205) {
          await store.set("APIClient", res.data);
          this.accountStatus = accountStatus.needsMFA;
        } else {
          this.accountStatus = accountStatus.notLoggedIn;
        }
        await store.set("APIClient", res.data);
      } catch (error) {
        this.accountStatus = accountStatus.notLoggedIn;
        console.error("Error submitting MFA", error);
      }
    },
    async signoutUser() {
      await store.remove("APIClient");
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
  },
});
