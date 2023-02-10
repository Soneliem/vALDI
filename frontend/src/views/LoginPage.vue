<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-grid class="grid">
        <ion-row class="ion-align-items-center grid">
          <ion-col
            ><ion-card class="card">
              <ion-card-header class="ion-margin">
                <ion-card-title
                  ><img class="s-logo" src="/assets/riot.png" />Sign
                  In</ion-card-title
                >
                <ion-card-subtitle
                  >Sign in with your Riot credentials</ion-card-subtitle
                >
              </ion-card-header>
              <ion-card-content>
                <ion-item-group>
                  <ion-item fill="solid" class="ion-margin">
                    <ion-label position="floating">Username</ion-label>
                    <ion-input
                      appAutofill
                      autocomplete="username"
                      v-model="form.username"
                      inputmode="email"
                      id="username"
                      required
                    ></ion-input>
                  </ion-item>

                  <ion-item fill="solid" class="ion-margin">
                    <ion-label position="floating">Password</ion-label>
                    <ion-input
                      appAutofill
                      autocomplete="current-password"
                      type="password"
                      v-model="form.password"
                      id="password"
                      required
                    ></ion-input>
                  </ion-item>

                  <ion-item fill="solid" class="ion-margin">
                    <ion-select
                      appAutofill
                      interface="popover"
                      placeholder="Select Region"
                      v-model="form.region"
                      type="text"
                    >
                      <ion-select-option value="na"
                        >North America</ion-select-option
                      >
                      <ion-select-option value="latam"
                        >Latin America</ion-select-option
                      >
                      <ion-select-option value="br">Brazil</ion-select-option>
                      <ion-select-option value="eu">Europe</ion-select-option>
                      <ion-select-option value="kr">Korea</ion-select-option>
                      <ion-select-option value="ap"
                        >Asia Pacific</ion-select-option
                      >
                    </ion-select>
                  </ion-item>

                  <ion-item class="ion-margin">
                    <ion-button type="submit" @click="login()">
                      Sign In
                      <ion-icon slot="end" :icon="logIn"></ion-icon>
                    </ion-button>
                  </ion-item>
                </ion-item-group>
              </ion-card-content> </ion-card
          ></ion-col>
          <ion-col
            ><ion-card class="card info"
              ><ion-card-header class="ion-margin">
                <ion-card-title>
                  <div class="center">
                    <img class="logo" src="/assets/icon/icon.png" />
                  </div>
                </ion-card-title>
                <ion-card-subtitle
                  >A simple cross-platform web and mobile app to view your
                  Valorant store. Created by Soneliem. <br /><br />
                  Name derived after my favourite grocery store that overworks
                  and understaffs its workers
                  <br /><br />
                  <a href="https://valdi.sonel.dev/privacy"
                    >Privacy Policy</a
                  ></ion-card-subtitle
                >
              </ion-card-header>
              <ion-card-content>
                <div class="spread">
                  <a
                    href="https://github.com/Soneliem/vALDI"
                    target="_blank"
                    title="Open GitHub Repo"
                    ><img class="sm-logo" src="/assets/github.png"
                  /></a>
                  <a
                    href="https://discord.gg/X7CYCeZSRK"
                    target="_blank"
                    title="Open Discord Server"
                    ><img class="sm-logo" src="/assets/discord.png" /></a
                  ><a
                    href="https://waiua.sonel.dev"
                    target="_blank"
                    title="Check out WAIUA"
                    ><img class="sm-logo" src="/assets/waiua.png"
                  /></a>
                </div>
              </ion-card-content> </ion-card
          ></ion-col>
        </ion-row>
      </ion-grid>

      <!-- <ion-loading :is-open="isLoading" message="Logging In..."></ion-loading> -->
      <ion-modal :is-open="mfaOpen">
        <ion-header>
          <ion-toolbar>
            <ion-title>Multi Factor Authentication</ion-title>
            <ion-buttons slot="start">
              <ion-button @click="mfaOpen = false">Back</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <p class="ion-padding-horizontal">
            A code has been sent to your email. Please enter it below.
          </p>
          <ion-item>
            <ion-label position="stacked">Code</ion-label>
            <ion-input
              type="number"
              placeholder="000000"
              v-model="code"
            ></ion-input>
          </ion-item>
          <ion-button type="submit" @click="submitMFA()">Submit</ion-button>
        </ion-content>
      </ion-modal>
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
  IonGrid,
  IonRow,
  IonCol,
  IonItemGroup,
  IonButton,
  IonLabel,
  IonInput,
  IonIcon,
  useIonRouter,
  IonToolbar,
  IonModal,
  IonHeader,
  IonButtons,
  IonTitle,
  loadingController,
} from "@ionic/vue";
import { logIn } from "ionicons/icons";
import { ref } from "vue";
import { useAccountStore } from "../store/account";
const accountStore = useAccountStore();
const ionRouter = useIonRouter();
const form = {
  username: "",
  password: "",
  region: "na",
};
const code = ref("");

const isLoading = ref();
const mfaOpen = ref(false);

async function showLoading() {
  isLoading.value = await loadingController.create({
    message: "Logging In...",
  });
  isLoading.value.present();
}

async function hideLoading() {
  await loadingController.dismiss();
}

async function login() {
  await showLoading();
  await accountStore.signInUser(form.username, form.password, form.region);
  await hideLoading();
  if (accountStore.accountStatus === accountStatus.loggedIn) {
    ionRouter.replace("/store");
  } else if (accountStore.accountStatus === accountStatus.needsMFA) {
    mfaOpen.value = true;
  } else {
    alert("Error Signing In");
  }
}

async function submitMFA() {
  await showLoading();
  await accountStore.submitMFA(code.value);
  await hideLoading();
  if (accountStore.accountStatus === accountStatus.loggedIn) {
    mfaOpen.value = false;
    ionRouter.replace("/store");
  } else if (accountStore.accountStatus === accountStatus.needsMFA) {
    mfaOpen.value = true;
  } else {
    alert("Error Signing In");
  }
}
</script>

<style scoped>
.grid {
  min-height: 100vh;
  padding: 0;
}
.card {
  min-width: 350px;
  width: fit-content;
  margin: auto;
}

.info {
  max-width: 350px;
}

.logo {
  height: 125px;
}

.sm-logo {
  height: 4em;
}

.s-logo {
  height: 1em;
  margin-right: 10px;
}

.center {
  display: flex;
  justify-content: center;
  margin-bottom: 2em;
}

.spread {
  display: flex;
  justify-content: space-around;
}
</style>
