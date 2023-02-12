import { createRouter, createWebHistory } from "@ionic/vue-router";
import { NavigationGuard, RouteRecordRaw } from "vue-router";
import { useAccountStore } from "../store/account";
import TabsPage from "../views/TabsPage.vue";
import { loadingController } from "@ionic/vue";

const authCheck: NavigationGuard = async function (to, from, next) {
  const loading = await loadingController.create({
    message: "Loading Page",
    spinner: "dots",
    animated: true,
  });

  await loading.present();
  if (
    to.path != "/login" &&
    to.path != "/privacy" &&
    !useAccountStore().isLoggedIn
  ) {
    if (!(await useAccountStore().tryReauth())) {
      await loading.dismiss();
      next({ path: "/login" });
    }
  }
  await loading.dismiss();
  next();
};
const routes: Array<RouteRecordRaw> = [
  {
    name: "login",
    path: "/login",
    component: () => import("@/views/LoginPage.vue"),
  },
  {
    name: "privacy",
    path: "/privacy",
    component: () => import("@/views/PolicyPage.vue"),
  },
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
        path: "store",
        component: () => import("@/views/StorePage.vue"),
        beforeEnter: authCheck,
      },
      {
        path: "wishlist",
        component: () => import("@/views/WishlistPage.vue"),
        beforeEnter: authCheck,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
