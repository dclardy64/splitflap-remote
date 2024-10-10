<template>
    <v-container class="pa-0">
        <h2 class="text-center">Message Queue</h2>
        <Display v-if="splitflap.mode === 'queue'" :flaps="splitflap.flaps"></Display>
        <p v-else :style="{ 'line-height': xs ? '76px' : '116px'}" class="text-center"><small>Select a queue to play.</small></p>
        <v-divider class="my-2"/>
        <v-list :style="{ height: `calc(100dvh - ${xs ? 320 : 360}px - ${isPwa ? 40 : 0}px)` }">
            <v-list-item v-if="!queues.length" class="text-center">
            Click '<v-icon icon="mdi-plus" class="mb-2"/>' to create a new queue.
            </v-list-item>
            <v-list-item v-for="(queue, index) of queues" @click="playQueue(index)">
                <template v-slot:title>
                    {{ queue.name }}
                </template>
                <template v-slot:append>
                    <small class="mr-2">({{ queue.queue.length }})</small>
                    <v-btn icon="mdi-pencil" size="small" variant="plain" color="primary" @click.stop="editQueue(index)" />
                    <v-btn icon="mdi-delete" size="small" variant="plain" color="error" @click.stop="deleteQueue(index)" />
                </template>
            </v-list-item>
        </v-list>
        <v-fab icon="mdi-plus" absolute location="top right" class="mt-2 mr-2" @click="createQueue"/>
        <QueueEditor v-if="queueToEdit !== undefined" :queue="queueToEdit" @cancel="onEditorCancel" @save="onEditorSave"/>
    </v-container>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { useDisplay } from 'vuetify'
import axios from 'axios'
import isPwa from '@/isPwa'

import type { Ref } from 'vue'
import type { Queue } from '@/components/QueueEditor.vue'
import type { SplitflapState } from '@/App.vue'

import defaultQueue from '@/queueMessages'

const { xs } = useDisplay()

const app = getCurrentInstance()
const splitflap: Ref<SplitflapState> = app!.root.exposed!.splitflap

const tmp = localStorage.getItem('queues')

const queues = ref<Array<Queue>>(tmp !== null ? JSON.parse(tmp) : defaultQueue)

const queueIndexToEdit = ref(-1)
const queueToEdit = ref<undefined | Queue>()

const playQueue = async (index: number) => axios.post('/api/queue', queues.value[index])
const createQueue = () => {
    queueIndexToEdit.value = -1
    queueToEdit.value = {
        name: 'myNewQueue',
        loop: false,
        queue: [{ 
            flaps: '     HELLO,         WORLD!    ',
            delay: 2000,
            await: true
        }]
    }
}
const editQueue = (index: number) => {
    queueIndexToEdit.value = index
    queueToEdit.value = queues.value[index]
}
const deleteQueue = (index: number) => {
    queues.value.splice(index, 1)
    localStorage.setItem('queues', JSON.stringify(queues.value))
}

const onEditorCancel = () => {
    queueToEdit.value = undefined
    queueIndexToEdit.value = -1
}
const onEditorSave = (queue: Queue) => {
    if (queueIndexToEdit.value === -1)
        queues.value.push(queue)
    else
        queues.value.splice(queueIndexToEdit.value, 1, queue)
    onEditorCancel()
    localStorage.setItem('queues', JSON.stringify(queues.value))
}
</script>
