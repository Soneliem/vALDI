<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-card class="card">
        <ion-card-header>
          <ion-card-title>Account</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>
            <b>{{ accountStore.user.username }}</b>
          </p>
          <p>
            <b>Level {{ accountStore.user.level }}</b>
          </p>
          <ion-button type="submit" @click="logout()">
            Sign Out
            <ion-icon slot="end" :icon="logIn"></ion-icon>
          </ion-button>
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
  loadingController,
} from "@ionic/vue";
import { logIn } from "ionicons/icons";
import { ref } from "vue";
import { useAccountStore } from "../store/account";

const accountStore = useAccountStore();
const ionRouter = useIonRouter();
const isLoading = ref();

async function logout() {
  isLoading.value = await loadingController.create({
    message: "Logging In",
    spinner: "dots",
    animated: true,
  });
  await isLoading.value.present();
  await accountStore.signoutUser();
  await isLoading.value.dismiss();
  ionRouter.replace("/login");
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
