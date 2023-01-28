<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-card class="card">
        <ion-card-header>
          <ion-card-title
            >Wishlist
            <ion-toggle
              :enable-on-off-labels="true"
              @ion-change="registerNotifications"
            ></ion-toggle
          ></ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <!-- <ion-button type="submit" @click="registerNotifications()">
            Allow Push Notifications
            <ion-icon slot="end" :icon="logIn"></ion-icon>
          </ion-button> -->
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
  IonToggle,
  IonCardHeader,
  IonCardTitle,
} from "@ionic/vue";
import { PushNotifications } from "@capacitor/push-notifications";
import { IonToggleCustomEvent, ToggleChangeEventDetail } from "@ionic/core";

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

async function registerNotifications(
  e: IonToggleCustomEvent<ToggleChangeEventDetail<any>>
) {
  if (e.detail.checked === false) {
    await PushNotifications.removeAllListeners();
  } else {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
      throw new Error("User denied permissions!");
    }

    await PushNotifications.register();
    await addListeners();
  }
}
</script>

<style scoped>
.card {
}
</style>
