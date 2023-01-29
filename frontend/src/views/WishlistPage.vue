<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-header>
        <ion-toolbar>
          <ion-title>Wishlist</ion-title>
        </ion-toolbar>
        <div class="warning">
          Adding skins to your wishlist saves your account access tokens to a
          secure database
        </div>
        <ion-toolbar>
          <ion-searchbar
            :debounce="200"
            show-cancel-button="focus"
            show-clear-button="always"
            :animated="true"
            placeholder="Search Skin"
            @ionChange="input = $event.target.value ?? ''"
          ></ion-searchbar>
        </ion-toolbar>
      </ion-header>
      <ion-list>
        <ion-item v-for="item in results" :key="item.refIndex">
          <img
            class="image"
            slot="start"
            alt="Icon"
            :src="(item.item.displayIcon as string | undefined)"
          />
          <ion-label>{{ item.item.displayName }}</ion-label>
          <ion-button slot="end">
            +
            <!-- <ion-icon :name="addCircleOutline" slot="icon-only"></ion-icon> -->
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonList,
  IonTitle,
  IonSearchbar,
  IonItem,
  IonLabel,
  // IonIcon,
} from "@ionic/vue";
import { PushNotifications } from "@capacitor/push-notifications";
import { useFuse } from "@vueuse/integrations/useFuse";
import { IonToggleCustomEvent, ToggleChangeEventDetail } from "@ionic/core";
import { onMounted, Ref, ref } from "vue";
import { Skin } from "@/models/index";
// import { addCircleOutline } from "ionicons/icons";
import axios from "axios";

const data: Ref<Skin[]> = ref([]);
const input: Ref<string> = ref("");
const { results } = useFuse(input, data, {
  fuseOptions: { keys: ["displayName"] },
  resultLimit: 5,
});

onMounted(async () => {
  try {
    const res = await axios.get("https://valorant-api.com/v1/weapons/skins");
    if (res.status == 200) {
      data.value = res.data.data;
    }
  } catch (error) {
    console.error("Error getting skins", error);
  }
});

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

async function requestPermissions(
  e: IonToggleCustomEvent<ToggleChangeEventDetail<any>>
) {
  if (e.detail.checked) {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
      throw new Error("User denied permissions!");
    }
  }
}

async function registerNotifications() {
  await PushNotifications.register();
  await addListeners();
}
</script>

<style scoped>
.image {
  max-width: 100px;
  max-height: 50px;
}

.warning {
  background-color: #ffb300;
  color: black;
  padding: 0.5em;
  font-size: smaller;
  text-align: center;
}
</style>
