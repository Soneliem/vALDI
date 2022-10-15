import { createRouter, createWebHistory } from "@ionic/vue-router";
import { NavigationGuard, RouteRecordRaw } from "vue-router";
import { useAccountStore } from "../store";
import TabsPage from "../views/TabsPage.vue";
import LoginPage from "../views/LoginPage.vue";
import StorePage from "../views/StorePage.vue";
import AccountPage from "../views/AccountPage.vue";

const authCheck: NavigationGuard = function (to, from, next) {
  if (!useAccountStore().isLoggedIn) {
    next({ name: "login" });
  } else {
    next();
  }
};

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/tabs/store",
  },
  {
    name: "login",
    path: "/login",
    component: () => LoginPage,
  },
  {
    path: "/tabs/",
    component: TabsPage,
    children: [
      {
        path: "",
        redirect: "/tabs/store",
      },
      {
        path: "store",
        component: () => StorePage,
        beforeEnter: authCheck,
      },
      {
        path: "account",
        component: () => AccountPage,
        beforeEnter: authCheck,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
