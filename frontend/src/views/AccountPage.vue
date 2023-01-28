<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-card class="card">
        <!-- <ion-card-header>
          <ion-card-title>Sign In</ion-card-title>
        </ion-card-header> -->
        <ion-card-content>
          <ion-button type="submit" @click="logout()">
            Sign Out
            <ion-icon slot="end" :icon="logIn"></ion-icon>
          </ion-button>
          <ion-button type="submit" @click="registerNotifications()">
            Allow Push Notifications
            <ion-icon slot="end" :icon="logIn"></ion-icon>
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  useIonRouter,
  loadingController,
} from "@ionic/vue";
import { logIn } from "ionicons/icons";
import { ref } from "vue";
import { useAccountStore } from "../store/account";
import { PushNotifications } from "@capacitor/push-notifications";

const accountStore = useAccountStore();
const ionRouter = useIonRouter();

const isLoading = ref();

async function logout() {
  isLoading.value = await loadingController.create({
    message: "Logging In...",
  });
  isLoading.value.present();
  await accountStore.signoutUser();
  isLoading.value.dismiss();
  ionRouter.replace("/login");
}

async function addListeners() {
  await PushNotifications.addListener("registration", (token) => {
    console.info("Registration token: ", token.value);
  });

  await PushNotifications.addListener("registrationError", (err) => {
    console.error("Registration error: ", err.error);
  });

  await PushNotifications.addListener(
    "pushNotificationReceived",
    (notification) => {
      console.log("Push notification received: ", notification);
    }
  );

  await PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (notification) => {
      console.log(
        "Push notification action performed",
        notification.actionId,
        notification.inputValue
      );
    }
  );
}

async function registerNotifications() {
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === "prompt") {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== "granted") {
    throw new Error("User denied permissions!");
  }

  await PushNotifications.register();
  await addListeners();
  await getDeliveredNotifications();
}

async function getDeliveredNotifications() {
  const notificationList = await PushNotifications.getDeliveredNotifications();
  console.log("delivered notifications", notificationList);
}
</script>

<style scoped>
.card {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 1em;
}
</style>
