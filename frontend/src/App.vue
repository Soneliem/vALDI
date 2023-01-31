<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { onMounted } from "vue";
import { useAccountStore } from "@/store/account";

const accountStore = useAccountStore();

onMounted(async () => {
  if (accountStore.isLoggedIn) {
    await accountStore.updateAccount();
  }
});
</script>
