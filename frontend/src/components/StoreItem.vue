<template>
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
  <ion-card v-if="!loading" style="width: fit-content" @click="show = true">
    <ion-card-content class="ion-padding card-content" :class="{ rgb: show }">
      <img class="image" :alt="name" :class="{ show: show }" :src="image" />
    </ion-card-content>
    <ion-card-header>
      <ion-card-title v-if="show">{{ name }}</ion-card-title>
      <ion-card-title v-if="!show">Click to Reveal</ion-card-title>
      <ion-card-subtitle
        ><img
          class="coin"
          src="https://media.valorant-api.com/currencies/85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741/displayicon.png"
        /><b
          v-if="show"
          class="ion-text-center"
          style="vertical-align: bottom"
          >{{ price }}</b
        >
        <del
          v-if="show && discount"
          class="ion-text-center discount"
          style="vertical-align: bottom"
          >{{ originalPrice }}</del
        >
        <b
          v-if="show && discount"
          class="ion-text-center"
          style="vertical-align: bottom"
          >(-{{ discount }}%)
        </b>

        <b v-if="!show" class="ion-text-center" style="vertical-align: bottom"
          >???</b
        ></ion-card-subtitle
      >
    </ion-card-header>
    <ion-button v-if="removeButton" @click="$emit('remove')" fill="clear"
      >Remove</ion-button
    >
  </ion-card>
</template>

<script lang="ts" setup>
import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonSkeletonText,
  IonButton,
} from "@ionic/vue";
import { defineProps, ref, defineEmits } from "vue";

const props = defineProps<{
  name?: string;
  image?: string;
  price?: number;
  loading?: boolean;
  show?: boolean;
  removeButton?: boolean;
  discount?: number;
  originalPrice?: number;
}>();

defineEmits(["remove"]);

const show = ref(false);
if (props.show) {
  show.value = true;
}
</script>

<style scoped>
.rgb {
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
  visibility: hidden;
}

.coin {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  vertical-align: middle;
}

.discount {
  color: rgb(255, 69, 69);
  padding: 0px 2px 0px 5px;
}

.show {
  animation: bounce-in 1s;
  visibility: visible;
}

.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}
</style>
