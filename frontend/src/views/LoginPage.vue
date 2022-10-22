<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- <form v-on:@submit.prevent="login"> -->
      <ion-card class="ion-justify-content-center">
        <ion-card-header>
          <ion-card-title>Sign In</ion-card-title>
          <ion-card-subtitle>Sign in with your Riot credentials</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-item-group>
            <ion-item fill="solid">
              <ion-label position="floating">Username</ion-label>
              <ion-input v-model="form.username" inputmode="email" id="username" required></ion-input>
            </ion-item>

            <ion-item fill="solid">
              <ion-label position="floating">Password</ion-label>
              <ion-input type="password" v-model="form.password" id="password" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-select interface="popover" placeholder="Select Region" v-model="form.region">
                <ion-select-option value="na">North America</ion-select-option>
                <ion-select-option value="latam">Latin America</ion-select-option>
                <ion-select-option value="br">Brazil</ion-select-option>
                <ion-select-option value="eu">Europe</ion-select-option>
                <ion-select-option value="kr">Korea</ion-select-option>
                <ion-select-option value="ap">Asia Pacific</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-button type="submit" @click="login()">
                Sign In
                <ion-icon slot="end" :icon="logIn"></ion-icon>
              </ion-button>
              <ion-loading :is-open="isLoading" message="Logging In..."></ion-loading>
            </ion-item>
          </ion-item-group>
        </ion-card-content>
      </ion-card>
      <!-- </form> -->
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { accountStatus } from "@/models";
import {
  IonPage,
  IonSelect,
  IonSelectOption,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonItem,
  IonItemGroup,
  IonButton,
  IonLabel,
  IonInput,
  IonIcon,
  useIonRouter,
  IonLoading
} from "@ionic/vue";
import { logIn } from "ionicons/icons";
import { ref } from "vue";
import { useAccountStore } from "../store/account";
const store = useAccountStore();
const ionRouter = useIonRouter();
const form = {
  username: "",
  password: "",
  region: "na",
};

const isLoading = ref(false);

async function login() {
  isLoading.value = true;
  await store.signInUser(form.username, form.password, form.region);
  isLoading.value = false;
  if (store.accountStatus === accountStatus.loggedIn) {
    ionRouter.replace("/tabs/store");
  }
  else if (store.accountStatus === accountStatus.needsMFA) {
    alert("MFA Needed!");
  } else {
    alert("Invalid username or password");
  }
}
</script>
