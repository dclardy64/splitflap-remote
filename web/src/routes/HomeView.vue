<template>
    <div ref="home" style="text-align: center;">
        <h2 class="mt-2">Splitflap Status</h2>
        <v-divider class="my-2"/>
        <h4>Live State</h4>
        <Display :flaps="splitflap.flaps" selectable @select="onSelect" />
        <v-divider class="my-2"/>
        <h4>Mode: <span class="text-warning">{{ splitflap.mode }}</span></h4>
        <v-divider class="my-2"/>
        <v-btn block @click="reHomeSplitflap()" :loading="loading">RE-HOME SPLITFLAP</v-btn>
        <!-- Not working
        <v-divider class="my-2"/>
        <v-btn block @click="resetSplitflap" :loading="loading">RESET SPLITFLAP</v-btn>
        -->
    </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'
import type { Ref } from 'vue'
import type { SplitflapState } from '@/App.vue'
import axios from 'axios'

const app = getCurrentInstance()
const splitflap: Ref<SplitflapState> = app!.root.exposed!.splitflap // This feels janky but fuck it.

const loading = ref(false)

const reHomeSplitflap = async () => {
    loading.value = true
    await axios.post('/api/home')
    loading.value = false
}
/*
const resetSplitflap = async () => {
    loading.value = true
    await axios.post('/api/reset')
    loading.value = false
}
*/
const onSelect = (index: number) => {
    console.log('SELECTED: ' + index)
}

</script>