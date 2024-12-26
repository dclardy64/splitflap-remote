<template>
	<v-app :theme="theme">
		<v-app-bar elevation="2">
			<template v-slot:title>
				<v-btn size="large"  to="/" :active="$route.path === '/'" prepend-icon="mdi-counter" stacked>Splitflap</v-btn>
			</template>
			<template v-slot:append>
				<v-btn prepend-icon="mdi-theme-light-dark" :text="theme === 'dark' ? 'Light' : 'Dark'" @click="toggleTheme" ></v-btn>
			</template>

		</v-app-bar>
		<v-main>
			<RouterView />
		</v-main>
		<v-bottom-navigation :style="isPwa ? 'height: 100px; padding-bottom: 40px;' : undefined">
			<v-btn to="/manual" ref="navManual">
				<v-icon>mdi-format-text</v-icon>
				<span>Manual</span>
			</v-btn>
			<v-btn to="/queue">
				<v-icon>mdi-queue-first-in-last-out</v-icon>
				<span>Queue</span>
			</v-btn>
			<v-btn to="/scoreboard">
				<v-icon>mdi-scoreboard-outline</v-icon>
				<span>Scores</span>
			</v-btn>
			<v-btn to="/spotify">
				<v-icon>mdi-spotify</v-icon>
				<span>Spotify</span>
			</v-btn>
		</v-bottom-navigation>
	</v-app>
</template>

<script setup lang="ts">

import { ref } from 'vue'
import socket from './socketio'

import isPwa from './isPwa'

const navManual = ref(null)

export type SplitflapState = { mode: 'manual' | 'scoreboard' | 'spotify' | 'queue', flaps: string }

const splitflap = ref<SplitflapState>({ mode: 'manual', flaps: (new Array(24).fill(' ').join('')) })

defineExpose({splitflap})

const theme = ref(localStorage.getItem('theme') as 'light' | 'dark' || 'dark')
const toggleTheme = () => {
	theme.value = theme.value === 'dark' ? 'light' : 'dark'
	localStorage.setItem('theme', theme.value)
}

socket.on('connect', () => console.log('CONNECTED TO SOCKETIO'))
socket.on('mode', (mode) => splitflap.value.mode = mode)
socket.on('flaps', (flaps) => splitflap.value.flaps = flaps)
socket.on('log', (log) => {
	console.log(log)
})

</script>
