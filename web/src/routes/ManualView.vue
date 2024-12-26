<template>
    <v-container class="text-center pa-0">
        <h2>Manual Input</h2>
        <Display :flaps="isLoading ? splitflap.flaps : flaps" :index="index" @select="(i: number) => index = i"></Display>
        <Keyboard :disabled="isLoading || index < 0" @key="onKey" :bottom="`calc(60px + ${isPwa ? 40 : 0}px)`"></Keyboard>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, getCurrentInstance } from 'vue'
import isPwa from '@/isPwa'

import type { Ref } from 'vue'
import type { SplitflapState } from '@/App.vue'


const app = getCurrentInstance()

const splitflap: Ref<SplitflapState> = app!.root.exposed!.splitflap

const isLoading = ref(false)
const flaps = ref(localStorage.getItem('manual') || (new Array(30).fill(' ').join('')))
const index = ref(0)

const onKey = async (key: string) => {
    const tmpAry = flaps.value.split('')
    switch (key) {
        case 'Enter':
            index.value = -1
            isLoading.value = true
            await axios.post('/api/manual', { flaps: flaps.value })
            isLoading.value = false
            index.value = 0
            break
        case 'Escape':
        case 'Clear':
            tmpAry.fill(' ')
            index.value = 0
            break
        case 'Backspace':
            if (index.value === flaps.value.length - 1 && flaps.value[index.value] !== ' ') {
                tmpAry[index.value] = ' '
                break
            }
            tmpAry[index.value - 1] = ' '
            if (index.value - 1 >= 0)
                index.value--
            break
        case 'ArrowUp':
            if (index.value - 12 < 0)
                return
            index.value -= 12
            break
        case 'ArrowDown':
            if (index.value + 12 >= 24)
                return
            index.value += 12
            break
        case 'ArrowLeft':
            if (index.value - 1 < 0)
                return
            index.value--
            break;
        case 'ArrowRight':
            if (index.value + 1 >= 24)
                return
            index.value++
            break
        default:
            tmpAry[index.value] = key
            if (index.value + 1 < flaps.value.length)
                index.value++
    }
    flaps.value = tmpAry.join('')
    localStorage.setItem('manual', flaps.value)
}
</script>
