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
          <ion-button
            slot="end"
            @click="addSkins(item.item.uuid)"
            v-if="
              !accountStore.wishlist.some(
                (e) => e.name === item.item.displayName
              )
            "
          >
            +
            <!-- <ion-icon :name="addCircleOutline" slot="icon-only"></ion-icon> -->
          </ion-button>
          <ion-button
            color="danger"
            slot="end"
            @click="removeSkins(item.item.uuid)"
            v-if="
              accountStore.wishlist.some(
                (e) => e.name === item.item.displayName
              )
            "
          >
            -
            <!-- <ion-icon :name="removeCircleOutline" slot="icon-only"></ion-icon> -->
          </ion-button>
        </ion-item>
      </ion-list>
      <ion-grid>
        <ion-row>
          <ion-col v-for="skin in accountStore.wishlist" v-bind:key="skin.uuid">
            <StoreItem
              :loading="false"
              :name="skin.name"
              :image="skin.image"
              :price="skin.price"
              :show="true"
              :removeButton="true"
              @remove="removeSkins(skin.uuid)"
            ></StoreItem>
          </ion-col>
        </ion-row>
      </ion-grid>
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
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  loadingController,
  // IonIcon,
} from "@ionic/vue";
import StoreItem from "@/components/StoreItem.vue";
import { PushNotifications } from "@capacitor/push-notifications";
import { isPlatform } from "@ionic/vue";
import { useFuse } from "@vueuse/integrations/useFuse";
import { onMounted, Ref, ref } from "vue";
import { useAccountStore } from "@/store/account";
import { Skin } from "@/models/index";
// import { addCircleOutline } from "ionicons/icons";
// import { removeCircleOutline } from "ionicons/icons";
import { inject } from "vue";
import { getToken, Messaging } from "firebase/messaging";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const messaging: Messaging = inject("messaging")!;

const accountStore = useAccountStore();

const data: Ref<Skin[]> = ref([]);
const input: Ref<string> = ref("");
// const wishlist: Ref<StoreSkin[]> = ref([]);

const { results } = useFuse(input, data, {
  fuseOptions: { keys: ["displayName"] },
  resultLimit: 5,
});

onMounted(async () => {
  data.value = await accountStore.getSkins();
});

async function addSkins(id: string) {
  const loader = await loadingController.create({
    message: "Adding to Wishlist",
  });
  await loader.present();
  if (isPlatform("desktop") || isPlatform("mobileweb")) {
    getToken(messaging, {
      vapidKey:
        "BEE2j59DvCw1hYAQMU_Idnyc83s4duwu-bQ4FE1bAUd_7r893SQGpxB96TgyicBukjtUOCs_w4nENjpNhC1aH0o",
    })
      .then(async (currentToken) => {
        if (currentToken) {
          await accountStore.addWishlistItem(id, currentToken);
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
      await accountStore.addWishlistItem(id, token.value);
    });
  }
  await loader.dismiss();
}

async function removeSkins(id: string) {
  const loader = await loadingController.create({
    message: "Removing from Wishlist",
  });
  await loader.present();
  await accountStore.removeWishlistItem(id);
  await loader.dismiss();
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
