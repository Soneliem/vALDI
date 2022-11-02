<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Store</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Store</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-grid>
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
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonGrid, IonCol } from '@ionic/vue';
import StoreItem from '@/components/StoreItem.vue';
import { useAccountStore } from '@/store/account';
import { onMounted, Ref, ref } from 'vue';
import { Store } from "@/models";
const accountStore = useAccountStore();
let store: Ref<Store> = ref({ bundles: [], skins: [], remainingTime: 0 });
const isLoading = ref(true);

onMounted(async () => {
  store.value = await accountStore.getStore();
  console.log(await accountStore.getStore())
  isLoading.value = false;
});

</script>

<style scoped>

</style>