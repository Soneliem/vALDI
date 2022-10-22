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
      try {
        const res = await axios.post("http://localhost:3000/api/auth", {
          username: username,
          password: password,
          region: region,
        });
        this.APIClient = res.data;

        if (res.status == 200) {
          this.accountStatus = accountStatus.loggedIn;
        } else if (res.status == 205) {
          this.accountStatus = accountStatus.needsMFA;
        } else {
          this.accountStatus = accountStatus.notLoggedIn;
        }
      } catch (error) {
        this.accountStatus = accountStatus.notLoggedIn;
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
