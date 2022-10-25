import { defineStore } from "pinia";
import axios from "axios";
import { accountStatus } from "@/models";

import { Storage } from "@ionic/storage";
const store = new Storage();
await store.create();

export const useAccountStore = defineStore("accountStore", {
  state: () => ({ accountStatus: accountStatus.notLoggedIn }),
  getters: {
    isLoggedIn: (state) => state.accountStatus == accountStatus.loggedIn,
  },
  actions: {
    async signInUser(username: string, password: string, region: string) {
      try {
        const res = await axios.post("http://localhost:3000/api/auth", {
          username: username,
          password: password,
          region: region,
        });
        if (res.status == 200) {
          await store.set("APIClient", res.data);
          this.accountStatus = accountStatus.loggedIn;
        } else if (res.status == 205) {
          await store.set("APIClient", res.data);
          this.accountStatus = accountStatus.needsMFA;
        } else {
          this.accountStatus = accountStatus.notLoggedIn;
        }
      } catch (error) {
        this.accountStatus = accountStatus.notLoggedIn;
        console.error("Error loggin in", error);
      }
    },
    async submitMFA(code: string) {
      try {
        const res = await axios.post("/api/auth/mfa", {
          code: code,
          APIClient: await store.get("APIClient"),
        });
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
    async getStore() {
      try {
        const res = await axios.post("/api/store", {
          APIClient: await store.get("APIClient"),
        });
        if (res.status == 200) {
          return res.data;
        }
      } catch (error) {
        console.error("Error getting store", error);
      }
    },
  },
});