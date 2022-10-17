import { createRouter, createWebHistory } from "@ionic/vue-router";
import { NavigationGuard, RouteRecordRaw } from "vue-router";
import { useAccountStore } from "../store";
import TabsPage from "../views/TabsPage.vue";
const authCheck: NavigationGuard = function (to, from, next) {
  if (!useAccountStore().isLoggedIn) {
    next({ path: "/tabs/login" });
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
    path: "/tabs/",
    component: TabsPage,
    children: [
      {
        path: "",
        redirect: "/tabs/store",
      },
      {
        path: "account",
        component: () => import("@/views/AccountPage.vue"),
        beforeEnter: authCheck,
      },
      {
        path: "login",
        component: () => import("@/views/LoginPage.vue"),
      },
      {
        path: "store",
        component: () => import("@/views/StorePage.vue"),
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
