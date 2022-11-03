<template>
  <div>
    <ion-card v-if="loading" style="width: fit-content; max-width: 1080px">
      <ion-skeleton-text
        :animated="true"
        class="skeletonImage"
      ></ion-skeleton-text>
      <ion-card-header>
        <ion-card-title>
          <ion-skeleton-text
            :animated="true"
            style="width: 30%"
          ></ion-skeleton-text>
        </ion-card-title>
        <ion-card-subtitle>
          <ion-skeleton-text
            :animated="true"
            style="width: 10%"
          ></ion-skeleton-text>
        </ion-card-subtitle>
      </ion-card-header>
    </ion-card>
    <ion-card v-if="!loading" style="width: fit-content; max-width: 1080px">
      <img class="image" :alt="name" :src="image" />
      <ion-card-header>
        <ion-card-title>{{ name }}</ion-card-title>
        <ion-card-subtitle>
          <img
            class="coin"
            src="https://media.valorant-api.com/currencies/85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741/displayicon.png"
          /><b class="ion-text-center">{{ price }}</b>
        </ion-card-subtitle>
      </ion-card-header>
    </ion-card>
  </div>
</template>

<script lang="ts" setup>
import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonSkeletonText,
} from "@ionic/vue";
import { defineProps } from "vue";

defineProps<{
  name?: string;
  image?: string;
  price?: number;
  loading?: boolean;
}>();
</script>

<style scoped>
.skeletonImage {
  width: 1648px;
  height: 804px;
}

.coin {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  vertical-align: middle;
}
</style>
