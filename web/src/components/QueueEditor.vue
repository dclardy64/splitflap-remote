<template>
    <v-dialog :model-value="true" transition="dialog-bottom-transition" persistent fullscreen :scrollable="false">
        <v-card>
            <template v-slot:actions style="overflow: hidden">
                <Keyboard :disabled="queueIndex === -1 || charIndex === -1" enter-disabled @key="onKey"
                    :bottom="isPwa ? '40px' : undefined" />
            </template>

            <v-card-text class="pa-0">
                <v-container :fluid="$vuetify.display.xs" class="pa-0">

                    <h2 style="height: 74px; line-height: 74px;" class="text-center">
                        Queue Editor
                        <v-btn class="mr-2 mt-2 float-right" size="small" prepend-icon="mdi-content-save" stacked
                            text="&nbsp;&nbsp;Save&nbsp;&nbsp;" color="success" variant="outlined"
                            @click="emit('save', newQueue)" />
                        <v-btn class="mr-2 mt-2 float-right" size="small" prepend-icon="mdi-cancel" text="Cancel"
                            stacked color="error" variant="outlined" @click="emit('cancel')" />
                    </h2>
                    <v-divider class="my-2" />

                    <v-text-field class="ml-2" label="Name" v-model="newQueue.name" :variant="'outlined'" hide-details>
                        <template v-slot:append>
                            <v-btn :prepend-icon="newQueue.loop ? 'mdi-sync' : 'mdi-sync-off'" class="mr-2"
                                variant="plain" :color="newQueue.loop ? 'primary' : undefined" :active="newQueue.loop"
                                @click.stop="newQueue.loop = !newQueue.loop" width="100px" size="large">
                                {{ newQueue.loop ? 'LOOP' : 'ONCE' }}
                            </v-btn>
                        </template>
                    </v-text-field>

                    <v-divider class="mt-2" />

                    <p v-if="!newQueue.queue.length" class="text-center mt-10">
                        Click '<v-icon icon="mdi-plus" />' to add a message.
                    </p>

                    <v-virtual-scroll ref="queueEditorList" :height="`calc(100dvh - 370px - ${isPwa ? 40 : 0}px)`"
                        :items="newQueue.queue" :item-height="200" style="padding-bottom: 50px;">

                        <template v-slot:default="{ item, index }">
                            <div style="height: 200px;">
                                <h3 style="padding-left: 6px; margin: 0 auto;">
                                    <v-btn class="float-right" icon="mdi-delete" variant="plain" color="error"
                                        @click="newQueue.queue.splice(index, 1)"></v-btn>
                                    <div class="pt-2 pb-3">#{{ index + 1 }}</div>
                                </h3>
                                <Display :flaps="item.flaps" small :index="queueIndex === index ? charIndex : -2"
                                    @select="(i: number) => { charIndex = i; queueIndex = index }" selectable />
                                <v-spacer class="mt-2" />
                                <v-row no-gutters>
                                    <v-col>
                                        <v-number-input label="Delay (ms)" :step="250" style="margin-left: 6px;"
                                            hide-details v-model="item.delay"></v-number-input>
                                    </v-col>
                                    <v-col>
                                        <v-checkbox label="Await?" class="float-right mr-4" hide-details
                                            v-model="item.await" />
                                    </v-col>
                                </v-row>
                                <v-divider class="my-2" />
                            </div>
                        </template>

                    </v-virtual-scroll>

                    <v-fab icon="mdi-plus" class="mr-2" absolute @click="newMessage" />

                </v-container>
            </v-card-text>
        </v-card>

    </v-dialog>
</template>

<script setup lang="ts">

import { nextTick, ref, useTemplateRef } from 'vue'
import isPwa from '@/isPwa';

const queueEditorList = useTemplateRef('queueEditorList')

export type Queue = { name: string, loop: boolean, queue: Array<{ flaps: string, await: boolean, delay: number }> }

const emit = defineEmits<{ save: [value: Queue], cancel: [] }>()

const queueIndex = ref(-1)
const charIndex = ref(-1)

const props = defineProps<{ queue: Queue }>()

const newQueue = ref<Queue>(JSON.parse(JSON.stringify(props.queue)))

const newMessage = async () => {
    newQueue.value.queue.push({ flaps: (new Array(24).fill(' ').join('')), await: true, delay: 2000 })
    queueIndex.value = newQueue.value.queue.length - 1
    charIndex.value = 0
    // Wow this is hacky. nextTick seem to doesn't work properly with v-virtual-scroll. See: https://github.com/vuetifyjs/vuetify/issues/20482
    await nextTick()
    const rawEl = (queueEditorList.value?.$el as HTMLElement)
    rawEl.scrollTo({ top: rawEl.scrollHeight, behavior: 'smooth' })
    setTimeout(() => queueEditorList.value?.scrollToIndex(queueIndex.value), 50)
    setTimeout(() => queueEditorList.value?.scrollToIndex(queueIndex.value), 100)
    setTimeout(() => queueEditorList.value?.scrollToIndex(queueIndex.value), 150)
}

const onKey = (key: string) => {
    const tmpAry = newQueue.value.queue[queueIndex.value].flaps.split('')
    switch (key) {
        case 'Clear':
            newQueue.value.queue[queueIndex.value].flaps = Array(24).fill(' ').join('')
            charIndex.value = 0
            break;
        case 'Escape':
        case 'Backspace':
            if (charIndex.value === tmpAry.length - 1 && tmpAry[charIndex.value] !== ' ') {
                tmpAry[charIndex.value] = ' '
                newQueue.value.queue[queueIndex.value].flaps = tmpAry.join('')
                return
            }
            tmpAry[charIndex.value - 1] = ' '
            newQueue.value.queue[queueIndex.value].flaps = tmpAry.join('')
            if (charIndex.value - 1 >= 0)
                charIndex.value--
            break
        case 'ArrowUp':
            if (charIndex.value - 12 < 0) {
                if (queueIndex.value - 1 < 0)
                    return
                else {
                    queueIndex.value--
                    charIndex.value += 12
                }
            } else {
                charIndex.value -= 12
            }
            break
        case 'ArrowDown':
            if (charIndex.value + 12 >= 24) {
                if (queueIndex.value + 1 >= newQueue.value.queue.length)
                    return
                else {
                    queueIndex.value++
                    charIndex.value -= 12
                }
            } else {
                charIndex.value += 12
            }
            break
        case 'ArrowLeft':
            if (charIndex.value - 1 < 0) {
                if (queueIndex.value - 1 < 0)
                    return
                else {
                    queueIndex.value--
                    charIndex.value = 23
                }
            } else {
                charIndex.value--
            }
            break;
        case 'ArrowRight':
            if (charIndex.value + 1 >= 12) {
                if (queueIndex.value + 1 >= newQueue.value.queue.length)
                    return
                else {
                    queueIndex.value++
                    charIndex.value = 0
                }
            } else {
                charIndex.value++
            }
            break
        default:
            tmpAry[charIndex.value] = key
            newQueue.value.queue[queueIndex.value].flaps = tmpAry.join('')
            if (charIndex.value + 1 < tmpAry.length)
                charIndex.value++
    }
}


</script>
