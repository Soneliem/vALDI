<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-card class="card">
        <!-- <ion-card-header>
          <ion-card-title>Sign In</ion-card-title>
        </ion-card-header> -->
        <ion-card-content>
          <ion-button type="submit" @click="logout()">
            Sign Out
            <ion-icon slot="end" :icon="logIn"></ion-icon>
          </ion-button>
          <ion-loading
            :is-open="isLoading"
            message="Logging Out..."
          ></ion-loading>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  useIonRouter,
  IonLoading,
} from "@ionic/vue";
import { logIn } from "ionicons/icons";
import { ref } from "vue";
import { useAccountStore } from "../store/account";
const accountStore = useAccountStore();
const ionRouter = useIonRouter();

const isLoading = ref(false);

async function logout() {
  isLoading.value = true;
  await accountStore.signoutUser();
  isLoading.value = false;
  ionRouter.replace("/tabs/login");
}
</script>

<style scoped>
.card {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 1em;
}
</style>
