<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-segment @ionChange="segmentChanged" value="daily">
          <ion-segment-button value="daily">
            <ion-label>Daily</ion-label>
            <ion-icon :icon="timeOutline" />
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
        <ion-row class="ion-justify-content-center" v-if="isLoading">
          <ion-col size="auto" v-for="i in 4" v-bind:key="i">
            <StoreItem :loading="true"></StoreItem>
          </ion-col>
        </ion-row>
        <ion-row class="ion-justify-content-center" v-if="!isLoading">
          <ion-col size="auto" v-for="item in store.skins" v-bind:key="item.name">
            <StoreItem :loading="false" :image="item.image" :name="item.name" :price="item.price"></StoreItem>
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
          <ion-col size="auto" v-for="item in store.bundles" v-bind:key="item.name">
            <BundleItem :loading="false" :image="item.image" :name="item.name" :price="item.price"></BundleItem>
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
  IonLabel
} from "@ionic/vue";
import { timeOutline, albumsOutline } from 'ionicons/icons';
import StoreItem from "@/components/StoreItem.vue";
import BundleItem from "@/components/BundleItem.vue";
import { useAccountStore } from "@/store/account";
import { onMounted, Ref, ref } from "vue";
import { Store } from "@/models";
const accountStore = useAccountStore();
let store: Ref<Store> = ref({ bundles: [], skins: [], remainingTime: 0 });
const isLoading = ref(true);
let segment = ref("daily");

onMounted(async () => {
  store.value = await accountStore.getStore();
  console.log(await accountStore.getStore());
  isLoading.value = false;
});

function segmentChanged(ev: CustomEvent) {
  segment.value = ev.detail.value;
}
</script>

<style scoped>

</style>
