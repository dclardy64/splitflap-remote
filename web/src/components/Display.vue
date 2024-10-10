<template>
    <div class="display" ref="display" :style="{ width: xs || small ? '390px' : '600px'}">
        <div  class="flex-row">
            <div v-for="i in 15" class="flex display-char" :class="charClass(i - 1)"
                @click="emit('select', i - 1)" :style="'background-color: ' + getColourFromChar(flaps[i - 1])">{{
                    getColourFromChar(flaps[i - 1]) ? '' : flaps[i - 1] }}
            </div>
        </div>
        <div class="flex-row">
            <div v-for="i in 15" class="flex display-char" :class="charClass(i + 15 - 1)"
                @click="emit('select', i + 15 - 1)" :style="'background-color: ' + getColourFromChar(flaps[i + 15 - 1])">
                {{ getColourFromChar(flaps[i + 15 - 1]) ? '' : flaps[i + 15 - 1] }}
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">

import { useTemplateRef } from 'vue';
import { useDisplay } from 'vuetify'
import { onClickOutside } from '@vueuse/core'

const display = useTemplateRef('display')

const { xs } = useDisplay()

const emit = defineEmits<{
  select: [value: number]
}>()

onClickOutside(display, event =>{
    const ele = event.target as HTMLElement | null
    if (!ele || ele.classList.contains('key') || ele.classList.contains('key-icon') || ele.classList.contains('keyboard-row'))
        return
    emit('select', -1)
})

const { small, flaps, selectable, index } = defineProps({
    small: {
        type: Boolean,
        required: false,
        default: false
    },
    flaps: {
        type: String,
        required: true
    },
    selectable: {
        type: Boolean,
        required: false,
        default: false
    },
    index: {
        default: -2,
        required: false,
        type: Number
    }
})

const charClass = (i: number) => {
    return { 
        'selected-char': i === index,
        'pointer': index !== -2 || selectable,
        'char-small': small || xs.value,
        'char-large': !small
    }
}

const getColourFromChar = (key: string) => {
    switch (key) {
        case 'r':
            return 'rgb(255, 0, 0)';
        case 'w':
            return 'rgb(222,222,222)';
        case 'y':
            return 'rgb(255, 255, 0)';
        case 'p':
            return 'rgb(172, 0, 157)';
        case 'g':
            return 'rgb(42, 122, 116)';
        default:
            return null;
    }
}

</script>

<style scoped>
.display {
    margin: 0 auto;
}
.flex-row {
    display: flex;
}
.flex {
    display: flex;
    justify-content: center;
}
.display-char {
    touch-action: manipulation;
    align-items: center;
    margin: 1px;
    background-color: rgb(50, 50, 50);
    color: white;
}

.char-large {
    width:38px;
    height: 56px;
    font-size: 1.525rem;
    font-weight: 600;
}

.char-small {
    width: 24px;
    height: 36px;
    font-size: 1.125rem;
    font-weight: 600;
}

.pointer {
    cursor: pointer;
}

.selected-char {
    box-shadow: rgb(33, 135, 252) 0px 0px 1px 1px;
}


</style>