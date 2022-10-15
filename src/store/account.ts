import { defineStore } from "pinia";

export const useAccountStore = defineStore("accountStore", {
  state: () => ({ account: null }),
  getters: {
    isLoggedIn: (state) => state.account !== null,
  },
  actions: {
    async signInUser(username: string, password: string) {
      // await ValClient.login(username, password);
    },
    async signoutUser() {
      try {
        // await signOut();
        this.account = null;
        return true;
      } catch (e) {
        return false;
      }
    },
  },
});
