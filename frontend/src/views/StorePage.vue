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

      <StoreItem :loading="true" v-for="i in 4" v-bind:key="i"></StoreItem>

      <!-- <StoreItem :loading="false" v-for="item in store" v-bind:key="item"></StoreItem> -->

    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import StoreItem from '@/components/StoreItem.vue';
import { useAccountStore } from '@/store/account';
import { onMounted, Ref, ref } from 'vue';
const accountStore = useAccountStore();
let store: Ref<any[]> = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  // store = await accountStore.getStore();
  console.log(await accountStore.getStore())
  isLoading.value = false;
});

</script>