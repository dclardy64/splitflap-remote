<template>
    <v-container class="text-center pa-0">
        <h2 style="color: rgb(29, 185, 84)"><v-icon icon="mdi-spotify" size="small" class="mb-1"/> Spotify</h2>
        <div v-if="splitflap.mode === 'spotify'">
            <Display  :flaps="splitflap.flaps"></Display>
            <v-divider class="my-2"/>
            <v-btn :loading="loading" @click="disconnectSpotify" prepend-icon="mdi-logout" block>Disconnect from Spotify</v-btn>
        </div>
        <div v-else>
            <p>Display your "Now Playing" track from Spotify.<br/>Connect to your account to get started.</p>
            <v-divider class="my-2"/>
            <v-btn @click="connectSpotify" prepend-icon="mdi-connection" block>Connect to Spotify</v-btn>
        </div>
    </v-container>
</template>

<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'
import type { Ref } from 'vue'
import type { SplitflapState } from '@/App.vue';
import axios from 'axios';

const app = getCurrentInstance()

const splitflap: Ref<SplitflapState> = app!.root.exposed!.splitflap

const loading = ref(false)

const connectSpotify = () => {
    location.href = location.origin + '/api/spotify'
}

const disconnectSpotify = async () => { 
    loading.value = true
    await axios.post('/api/abort')
    loading.value = false
}

</script>