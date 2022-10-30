<template>
    <div>
        <ion-card v-if="loading">
            <img :alt="name" :src="image" />
            <ion-card-header>
                <ion-card-title>
                    <ion-skeleton-text :animated="true"></ion-skeleton-text>
                </ion-card-title>
                <ion-card-subtitle>
                    <ion-skeleton-text :animated="true"></ion-skeleton-text>
                </ion-card-subtitle>
            </ion-card-header>
        </ion-card>
        <ion-card v-if="!loading">
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
  