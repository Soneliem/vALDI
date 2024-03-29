<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-segment @ionChange="segmentChanged" value="daily">
          <ion-segment-button value="daily">
            <ion-label>Daily</ion-label>
            <ion-icon :icon="timeOutline" />
          </ion-segment-button>
          <ion-segment-button value="nightMarket" v-if="store.nightMarket">
            <ion-label>Night Market</ion-label>
            <ion-icon :icon="moonOutline" />
          </ion-segment-button>
          <ion-segment-button value="bundles">
            <ion-label>Bundles</ion-label>
            <ion-icon :icon="albumsOutline" />
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-grid v-if="segment == 'daily'">
        <ion-row class="ion-justify-content-center">
          <ion-toolbar class="notify">
            <ion-text slot="start">Receive daily store notification</ion-text>
            <ion-toggle
              slot="end"
              :checked="accountStore.notificationEnabled"
              @ionChange="toggleNotification"
            ></ion-toggle>
          </ion-toolbar>
        </ion-row>
        <ion-progress-bar :value="progress"></ion-progress-bar>
        <ion-row class="ion-justify-content-center" v-if="isLoading">
          <ion-col size="auto" v-for="i in 4" v-bind:key="i">
            <StoreItem :loading="true"></StoreItem>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center" v-if="!isLoading">
          <ion-col
            size="auto"
            v-for="item in store.skins"
            v-bind:key="item.uuid"
          >
            <StoreItem
              :loading="false"
              :image="item.image"
              :name="item.name"
              :price="item.price"
            ></StoreItem>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-grid v-if="segment == 'nightMarket'">
        <ion-row class="ion-justify-content-center" v-if="isLoading">
          <ion-col size="auto" v-for="i in 6" v-bind:key="i">
            <StoreItem :loading="true"></StoreItem>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center" v-if="!isLoading">
          <ion-col
            size="auto"
            v-for="item in store.nightMarket"
            v-bind:key="item.uuid"
          >
            <StoreItem
              :loading="false"
              :image="item.image"
              :name="item.name"
              :price="item.price"
              :originalPrice="item.originalPrice"
              :discount="item.discount"
            ></StoreItem>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-grid v-if="segment == 'bundles'">
        <ion-row class="ion-justify-content-center" v-if="isLoading">
          <ion-col size="auto">
            <BundleItem :loading="true"></BundleItem>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center" v-if="!isLoading">
          <ion-col
            size="auto"
            v-for="item in store.bundles"
            v-bind:key="item.name"
          >
            <BundleItem
              :loading="false"
              :image="item.image"
              :name="item.name"
              :price="item.price"
            ></BundleItem>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonRow,
  IonGrid,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonLabel,
  IonProgressBar,
  IonToggle,
  IonText,
  isPlatform,
} from "@ionic/vue";
import { timeOutline, albumsOutline, moonOutline } from "ionicons/icons";
import StoreItem from "@/components/StoreItem.vue";
import BundleItem from "@/components/BundleItem.vue";
import { useAccountStore } from "@/store/account";
import { onMounted, Ref, ref, watch } from "vue";
import { Store } from "@/models";
import { inject } from "vue";
import { getToken, Messaging } from "firebase/messaging";
import { PushNotifications } from "@capacitor/push-notifications";
let messaging: Messaging;
if (isPlatform("desktop") || isPlatform("mobileweb")) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  messaging = inject("messaging")!;
}

const accountStore = useAccountStore();
let store: Ref<Store> = ref({ bundles: [], skins: [], remainingTime: 0 });
const isLoading = ref(true);
let segment = ref("daily");
let progress = ref(60);

watch(
  () => store.value.remainingTime,
  (remainingTime) => {
    progress.value = remainingTime / 86400;
  }
);

onMounted(async () => {
  store.value = await accountStore.getStore();
  isLoading.value = false;
});

function segmentChanged(ev: CustomEvent) {
  segment.value = ev.detail.value;
}

function toggleNotification(ev: CustomEvent) {
  if (ev.detail.checked && !accountStore.notificationEnabled) enableNotify();
  else if (!ev.detail.checked && accountStore.notificationEnabled)
    accountStore.disableNotify();
}

async function enableNotify() {
  if (isPlatform("desktop") || isPlatform("mobileweb")) {
    getToken(messaging, {
      vapidKey:
        "BEE2j59DvCw1hYAQMU_Idnyc83s4duwu-bQ4FE1bAUd_7r893SQGpxB96TgyicBukjtUOCs_w4nENjpNhC1aH0o",
    })
      .then(async (currentToken) => {
        if (currentToken) {
          await accountStore.enableNotify(currentToken);
        } else {
          console.log(
            "No registration token available. Request permission to generate one."
          );
        }
      })
      .catch((err) => {
        console.log("An error occurred while retrieving token. ", err);
      });
  } else {
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== "granted") {
      throw new Error("User denied permissions!");
    }
    await PushNotifications.register();
    await PushNotifications.addListener("registration", async (token) => {
      console.info("Registration token: ", token.value);
      await accountStore.enableNotify(token.value);
    });
  }
}
</script>

<style scoped>
.notify {
  padding-left: 1em;
}
</style>
