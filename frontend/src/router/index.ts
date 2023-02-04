import { createRouter, createWebHistory } from "@ionic/vue-router";
import { NavigationGuard, RouteRecordRaw } from "vue-router";
import { useAccountStore } from "../store/account";
import TabsPage from "../views/TabsPage.vue";

const authCheck: NavigationGuard = async function (to, from, next) {
  if (to.path == "/login" || to.path == "/privacy") {
    next();
  } else if (!useAccountStore().isLoggedIn) {
    if (await useAccountStore().tryReauth()) {
      next();
    } else {
      next({ path: "/login" });
    }
  } else {
    next();
  }
};
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: TabsPage,
    children: [
      {
        path: "",
        redirect: "/store",
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
      {
        path: "wishlist",
        component: () => import("@/views/WishlistPage.vue"),
        beforeEnter: authCheck,
      },
      {
        path: "privacy",
        component: () => import("@/views/PolicyPage.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
