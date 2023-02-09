<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="store" href="/store">
          <ion-icon :icon="basketOutline" />
          <ion-label>Store</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="wishlist" href="/wishlist">
          <ion-icon :icon="bookmarkOutline" />
          <ion-label>Whishlist</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="account" href="/account">
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
import { basketOutline, personOutline, bookmarkOutline } from "ionicons/icons";
</script>
