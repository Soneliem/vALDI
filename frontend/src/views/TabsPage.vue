<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar
        slot="bottom"
        v-if="$router.currentRoute.value.path != '/tabs/login'"
      >
        <ion-tab-button tab="store" href="/tabs/store">
          <ion-icon :icon="basketOutline" />
          <ion-label>Store</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="account" href="/tabs/account">
          <ion-icon :icon="personOutline" />
          <ion-label>Account</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
} from "@ionic/vue";
import { basketOutline, personOutline } from "ionicons/icons";
</script>
