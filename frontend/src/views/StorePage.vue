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

      <ExploreContainer name="Store" />
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
</script>