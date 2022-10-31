<template>
    <div>
        <ion-card v-if="loading" style="width: fit-content;">
            <ion-skeleton-text :animated="true" style="width: 512px; height: 100px;"></ion-skeleton-text>
            <ion-card-header>
                <ion-card-title>
                    <ion-skeleton-text :animated="true" style="width: 30%;"></ion-skeleton-text>
                </ion-card-title>
                <ion-card-subtitle>
                    <ion-skeleton-text :animated="true" style="width: 10%;"></ion-skeleton-text>
                </ion-card-subtitle>
            </ion-card-header>
        </ion-card>
        <ion-card v-if="!loading" style="width: fit-content;">
            <img :alt="name" :src="image" />
            <ion-card-header>
                <ion-card-title>{{ name }}</ion-card-title>
                <ion-card-subtitle>{{ price }}</ion-card-subtitle>
            </ion-card-header>
        </ion-card>

    </div>
</template>
  
<script lang="ts" setup>
import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonSkeletonText } from '@ionic/vue'
import { defineProps } from 'vue'

defineProps<{
    name?: string,
    image?: string,
    price?: number
    loading?: boolean
}>();
</script>
  
<style scoped>

</style>
  