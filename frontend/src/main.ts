import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { IonicVue, isPlatform } from "@ionic/vue";
import { createPinia } from "pinia";
import { SplashScreen } from "@capacitor/splash-screen";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// await SplashScreen.show({
//   autoHide: false,
// });
const pinia = createPinia();
const app = createApp(App).use(IonicVue).use(router).use(pinia);

if (isPlatform("desktop") || isPlatform("mobileweb")) {
  const firebaseConfig = {
    apiKey: "AIzaSyDyulfcsQ9K-BwYhHDb9hUCckMZpxWrZeQ",
    authDomain: "valdi-bfdee.firebaseapp.com",
    projectId: "valdi-bfdee",
    storageBucket: "valdi-bfdee.appspot.com",
    messagingSenderId: "865302377509",
    appId: "1:865302377509:web:022b7bc80f5ea2e0cdbbcc",
    measurementId: "G-YCZ319P1Q7",
  };
  const fireapp = initializeApp(firebaseConfig);
  const messaging = getMessaging(fireapp);
  app.provide("messaging", messaging);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.isReady().then(() => {
  app.mount("#app");
  SplashScreen.hide();
});
