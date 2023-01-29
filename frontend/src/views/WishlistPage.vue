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
            :src="(item.item.displayIcon as string | undefined)"
          />
          <ion-label>{{ item.item.displayName }}</ion-label>
          <ion-button slot="end" @click="addSkins(item.item.uuid)">
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
import { onMounted, Ref, ref } from "vue";
import { useAccountStore } from "@/store/account";
import { Skin } from "@/models/index";
// import { addCircleOutline } from "ionicons/icons";
import axios from "axios";

const accountStore = useAccountStore();

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

async function addSkins(id: string) {
  // accountStore.addWishlistItem(id, "sdasdasda");
  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === "prompt") {
    permStatus = await PushNotifications.requestPermissions();
  }
  if (permStatus.receive !== "granted") {
    throw new Error("User denied permissions!");
  }
  await PushNotifications.register();
  await PushNotifications.addListener("registration", (token) => {
    console.info("Registration token: ", token.value);
    accountStore.addWishlistItem(id, token.value);
  });
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
