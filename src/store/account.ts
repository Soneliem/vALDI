import { defineStore } from "pinia";
import axios from "axios";
import { accountStatus } from "@/models";

export const APIClient = {};

export const useAccountStore = defineStore("accountStore", {
  state: () => ({ accountStatus: accountStatus.notLoggedIn, APIClient: {} }),
  getters: {
    isLoggedIn: (state) => state.accountStatus == accountStatus.loggedIn,
  },
  actions: {
    async signInUser(username: string, password: string, region: string) {
      const res = await axios.post("/api/auth", {
        username: username,
        password: password,
        region: region,
      });
      this.APIClient = res.data;

      if (res.status == 200) {
        this.accountStatus = accountStatus.loggedIn;
      }
      if (res.status == 511) {
        this.accountStatus = accountStatus.needsMFA;
      }
    },
    async submitMFA(code: string) {
      const res = await axios.post("/api/auth/mfa", {
        code: code,
      });
      this.APIClient = res.data;
    },
    async signoutUser() {
      this.APIClient = {};
      this.accountStatus = accountStatus.notLoggedIn;
    },
    async getStore() {
      const res = await axios.get("/api/store");
      return res.data;
    },
  },
});
