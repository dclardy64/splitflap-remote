<template>
    <div class="keyboard" :style="{ 'bottom': bottom }">
        <div class="keyboard-row" v-for="({ generic, alt }, rowIndex) of keyboardRows">
            <!-- Clear -->
            <div v-if="rowIndex === lastRowIndex" id="key-clear" :class="keyClasses.generic"
                @click="keyPress('Clear')">
                <v-icon icon="mdi-delete" class="key-icon" />
            </div>
            <!-- Key -->
            <div v-for="key of (altMode ? alt : generic)" :id="'key-' + (key === ' ' ? 'b' : key)"
                :class="keyClasses.generic" @click="keyPress(key)">
                {{
                    // Dont show color character when using mobile
                    (rowIndex === lastRowIndex && altMode && isMobile) ? '' :
                        // Show 'B' for black (space) key
                        (key === ' ') ? 'B' : key
                }}
            </div>
            <!-- Enter -->
            <div v-if="rowIndex === lastRowIndex" id="key-backspace" :class="keyClasses.generic"
                @click="keyPress('Backspace')">
                <v-icon icon="mdi-backspace" :size="20" class="key-icon" />
            </div>
        </div>
        <div class="keyboard-row">
            <!-- More -->
            <div id="key-alt" :class="keyClasses.more" @click="altMode = !altMode">
                123.?!@
            </div>
            <!-- Space -->
            <div id="key-space" :class="keyClasses.generic" @click="keyPress(' ')">
                SPACE
            </div>
            <!-- Enter -->
            <div id="key-enter" :class="keyClasses.enter" @click="keyPress('Enter')">
                ENTER
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { isMobile } from 'mobile-device-detect'

const { disabled, enterDisabled, bottom } = defineProps({
    disabled: {
        type: Boolean,
        required: false,
        default: false
    },
    enterDisabled: {
        type: Boolean,
        required: false,
        default: false
    },
    bottom: {
        type: String,
        required: false,
        default: '0'
    }
})

const emit = defineEmits<{ key: [value: string] }>()

const keyboardRows = [
    { generic: 'QWERTYUIOP', alt: '1234567890' },
    { generic: 'ASDFGHJKL', alt: '.!\'      ' },
    { generic: 'ZXCVBNM', alt: '       ' }
]
const lastRowIndex = keyboardRows.length - 1

const keyClasses = computed(() => ({
    generic: { 'disabled': disabled, 'key': true },
    enter: { 'disabled': disabled || enterDisabled, 'key': true },
    more: { 'alt-active': altMode.value, 'disabled': disabled, 'key': true }
}))

// Used to track target 'key' for mouse and touch events
let targetKey: HTMLElement | null = null

const altMode = ref(false)

const doesCharExist = (char: string) => {
    for (let r = 0; r < keyboardRows.length; r++) {
        for (let i = 0; i < keyboardRows[r].generic.length; i++) {
            if (keyboardRows[r].generic[i] === char)
                return true
        }
        for (let i = 0; i < keyboardRows[r].alt.length; i++) {
            if (keyboardRows[r].alt[i] === char)
                return true
        }
    }
    return false
}

const keyPress = (key: string) => {
    if (key === 'Enter' && enterDisabled)
        return
    if (!disabled)
        emit('key', key)
}

// Remove focus from active element.
const blur = () => {
    const activeElement = document.activeElement as HTMLElement | null
    if (activeElement === null)
        return
    activeElement.blur()
}

// Mouse, Touch and Keyboard Events
const onTouchStart = (evt: TouchEvent) => {
    if (disabled)
        return
    const target = (evt.target as HTMLElement | null)
    targetKey = target?.classList.contains('key-icon') ? target.parentElement : target
    blur()
    if (targetKey?.classList.contains('key'))
        targetKey.classList.add('hovering')
}
const onTouchEnd = (evt: TouchEvent) => {
    if (targetKey?.classList.contains('key'))
        setTimeout(() => { targetKey?.classList.remove('hovering') })
}
const onMouseDown = (evt: MouseEvent) => {
    if (disabled)
        return
    blur()
    const target = (evt.target as HTMLElement | null)
    targetKey = target?.classList.contains('key-icon') ? target.parentElement : target
    if (targetKey?.classList.contains('key'))
        targetKey.classList.add('hovering')
}
const onMouseUp = (evt: MouseEvent) => {
    if (targetKey?.classList.contains('key'))
        targetKey.classList.remove('hovering')
}
const onKeyDown = (evt: KeyboardEvent) => {
    if (disabled)
        return
    if (evt.keyCode === 222 || evt.keyCode === 191 || evt.key === 'ArrowUp' || evt.key === 'ArrowDown') // Prevent browser quicksearch/search for ' and / characters and prevent scroll on up/down
        evt.preventDefault()
    if (evt.key === 'Shift') {
        altMode.value = true
        return
    }
    const eleKey = evt.key === ' ' ? document.getElementById('key-space') :
            evt.key === 'Escape' ? document.getElementById('key-clear') :
            altMode.value ? document.getElementById('key-' + evt.key.toLowerCase()) :
            document.getElementById('key-' + evt.key.toUpperCase()) ||
            document.getElementById('key-' + evt.key.toLowerCase())
    blur()
    if (eleKey)
        eleKey.classList.add('hovering')
    if (doesCharExist(altMode.value ? evt.key.toLowerCase() : evt.key.toUpperCase())) {
        if (evt.key === ' ')
            keyPress(' ')
        else
            keyPress(altMode.value ? evt.key.toLowerCase() : evt.key.toUpperCase())
    } else if (evt.key === 'Enter' || evt.key === 'Backspace' || evt.key === 'Escape' || evt.key === 'ArrowLeft' || evt.key === 'ArrowRight' || evt.key === 'ArrowUp' || evt.key === 'ArrowDown') {
        keyPress(evt.key)
    } else if (eleKey?.id === 'key-b') {
        keyPress(' ')
    }
}
const onKeyUp = (evt: KeyboardEvent) => {
    const eleKey = evt.key === ' ' ? document.getElementById('key-space') :
        evt.key === 'Escape' ? document.getElementById('key-clear') :
        altMode.value ? document.getElementById('key-' + evt.key.toLowerCase()) :
            document.getElementById('key-' + evt.key.toUpperCase()) ||
            document.getElementById('key-' + evt.key.toLowerCase())
    if (evt.key === 'Shift') {
        altMode.value = false
        return
    }

    if (eleKey) {
        eleKey.classList.remove('hovering')
    }
}

// Register events on mount
onMounted(() => {
    document.addEventListener('touchstart', onTouchStart)
    document.addEventListener('touchend', onTouchEnd)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
})

// Deregister events on unmount
onUnmounted(() => {
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchend', onTouchEnd)
    document.removeEventListener('mousedown', onMouseDown)
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('keyup', onKeyUp)
})

</script>


<style scoped>
.keyboard {
    position: fixed;
    left: 0;
    width: 100%;
    -webkit-user-select: none;
    user-select: none;
}

.keyboard-row {
    display: flex;
    justify-content: center;
    margin: 0 auto;
    -webkit-user-select: none;
    user-select: none;
}

.key {
    user-select: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    display: flex;
    justify-content: center;
    cursor: pointer;
    height: 46px;
    width: 34px;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.75rem;
    gap: 3px;
    text-transform: uppercase;
    margin: 3px;
    align-items: center;
    border-radius: .125rem;
    border: solid gray 1px;
    -webkit-user-select: none;
    user-select: none;
}

@media (hover: hover) {
    .key:hover {
        opacity: 0.8;
    }
}

.hovering {
    opacity: 0.5 !important;
}

.disabled {
    opacity: 0.3 !important;
    cursor: default !important;
}

#key-alt {
    width: 60px;
    font-size: .775rem;
}

.alt-active {
    background-color: rgb(166, 166, 167);
}

#key-backspace {
    width: 60px !important;
    font-size: 1.875rem !important;
}

#key-clear {
    width: 60px !important;
    font-size: .875rem !important;
}

#key-space {
    width: 240px !important;
    font-size: .875rem !important;
}

#key-enter {
    width: 80px !important;
    font-size: .875rem !important;
    line-height: 1.25rem !important;
    background-color: rgb(0, 128, 255) !important;
    color: rgb(238, 238, 238);
}

#key-r {
    background-color: rgb(255, 0, 0) !important;
}

#key-y {
    background-color: rgb(255, 255, 0) !important;
    color: rgb(0, 0, 0) !important;
}

#key-p {
    background-color: rgb(172, 0, 157) !important;
}

#key-g {
    background-color: rgb(42, 122, 116) !important;
}

#key-b {
    background-color: rgb(0, 0, 0) !important;
    color: rgb(244, 244, 244) !important;
}

#key-w {
    background-color: rgb(244, 244, 244) !important;
    color: rgb(0, 0, 0) !important;
}
</style>
