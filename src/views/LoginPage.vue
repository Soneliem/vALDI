<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- <div class="login-logo">
        <img src="/assets/img/appicon.svg" alt="Ionic logo">
      </div> -->

      <form @submit.prevent="login">
        <ion-card class="ion-justify-content-center">
          <ion-card-header>
            <ion-card-title>Sign In</ion-card-title>
            <ion-card-subtitle>Sign in with your Riot credentials</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-item-group>
              <ion-item lines="full">
                <ion-label position="floating" color="primary">Username</ion-label>
                <ion-input v-model="form.username" inputmode="email" id="username" required></ion-input>
              </ion-item>

              <ion-item lines="full">
                <ion-label position="floating">Password</ion-label>
                <ion-input type="password" v-model="form.password" id="password" required></ion-input>
              </ion-item>

              <ion-item>
                <ion-button type="submit">
                  Sign In
                  <ion-icon slot="end" :icon="logIn"></ion-icon>
                </ion-button>
              </ion-item>
            </ion-item-group>
          </ion-card-content>
        </ion-card>
      </form>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonInput,
  IonButton,
  useIonRouter,
} from "@ionic/vue";
import { logIn, personAdd } from "ionicons/icons";
import { useAccountStore } from "@/store/account";

export default defineComponent({
  name: "LoginPage",
  components: {
    IonContent,
    IonPage,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonItemGroup,
    IonLabel,
    IonInput,
    IonButton,
  },
  setup() {
    const store = useAccountStore();
    const ionRouter = useIonRouter();
    const form = {
      username: "",
      password: "",
    };
    const login = async () => {
      if (await store.signInUser(form.username, form.password)) {
        ionRouter.replace("/tabs/store");
      }
      else {
        alert("Invalid username or password");
      }

      console.log(form);
    }
    return {
      login,
      personAdd,
      logIn,
      form,
    };
  },
});
</script>
