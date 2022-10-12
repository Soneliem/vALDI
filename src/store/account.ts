import { signIn, signOut } from "@/services/valorant";
import { defineStore } from "pinia";

export const useAccountStore = defineStore("accountStore", {
  state: () => ({ account: null }),
  getters: {
    isLoggedIn: (state) => state.account !== null,
  },
  actions: {
    async signInUser(email: string, password: string) {
      try {
        const response = await signIn(email, password);
        this.account = response ? response : null;
        return true;
      } catch (e) {
        this.account = null;
        return false;
      }
    },
    async signoutUser() {
      try {
        await signOut();
        this.account = null;
        return true;
      } catch (e) {
        return false;
      }
    },
  },
});
