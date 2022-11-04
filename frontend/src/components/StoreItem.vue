<template>
  <div>
    <ion-card v-if="loading" style="width: fit-content">
      <ion-card-content>
        <ion-skeleton-text
          :animated="true"
          class="skeletonImage"
        ></ion-skeleton-text>
      </ion-card-content>
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
    <ion-card v-if="!loading" style="width: auto">
      <ion-card-content
        ><img class="image ion-margin" :alt="name" :src="image" />
      </ion-card-content>
      <ion-card-header>
        <ion-card-title>{{ name }}</ion-card-title>
        <ion-card-subtitle
          ><img
            class="coin"
            src="https://media.valorant-api.com/currencies/85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741/displayicon.png"
          /><b class="ion-text-center">{{ price }}</b></ion-card-subtitle
        >
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
  IonCardContent,
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
ion-card-content {
  background: linear-gradient(270deg, #ee7752, #e73c7e, #1e8fb8, #23d5ab);
  animation: gradient 10s ease infinite;
  background-size: 400% 400%;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.skeletonImage {
  width: 400px;
  height: 150px;
}

.image {
  width: auto;
  max-height: 156px;
}

.coin {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  vertical-align: middle;
}
</style>
