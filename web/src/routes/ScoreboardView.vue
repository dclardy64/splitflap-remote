<template>
    <v-container class="pa-0 text-center">
        <v-btn width="160" class="float-right mt-1" color="info" :prepend-icon="`mdi-reorder-${scoreMode === 'row' ? 'horizontal' : 'vertical'}`" @click="scoreMode = scoreMode === 'row' ? 'column' : 'row'" variant="plain" size="small">{{  scoreMode }}s</v-btn>
        <h2 class="text-left ml-2">
            Scoreboard
        </h2>
        <Display v-if="splitflap.mode === 'scoreboard'" :flaps="splitflap.flaps"></Display>
        <p v-else :style="{ 'line-height': xs ? '76px' : '116px'}" class="text-center"><small>Select a game to display.</small></p>
        <v-divider class="my-2"/>
        <v-btn-group>
            <v-btn prepend-icon="mdi-hockey-puck" @click="selectLeague('nhl')" :active="league === 'nhl'"  :loading="loading && league === 'nhl'">NHL</v-btn>
            <v-btn prepend-icon="mdi-football" @click="selectLeague('nfl')" :active="league === 'nfl'"  :loading="loading && league === 'nfl'">NFL</v-btn>
            <v-btn prepend-icon="mdi-baseball" @click="selectLeague('mlb')" :active="league === 'mlb'"  :loading="loading && league === 'mlb'">MLB</v-btn>
            <v-btn prepend-icon="mdi-basketball" @click="selectLeague('nba')" :active="league === 'nba'" :loading="loading && league === 'nba'">NBA</v-btn>
        </v-btn-group>
        
        <v-spacer class="my-2"/>
        <v-list  class="pt-1">
            <v-virtual-scroll :items="scores" :height="`calc(100dvh - ${xs && !isPwa ? 322 : 362}px)`">
                <template v-slot:default="{ item, index }">
                    <v-list-item @click="selectGame(item.id)" :style="index % 2 ? undefined : { background: 'rgba(var(--v-theme-primary-darken-1), .1)' }" >
                        <span class="float-left ml-2 text-h3">{{ item.away.score }}</span>
                        <span class="float-right mr-2 text-h3">{{ item.home.score }}</span>
                        <h5 :class="item.status === 'final' ? 'text-error' : item.status === 'pre_game' ? 'text-primary' : 'text-success'">{{  (new Date(item.date)).toLocaleDateString() + ' ' +  (new Date(item.date)).toLocaleTimeString() }}</h5>
                        {{  xs ? item.away.short_name : mdAndDown ? item.away.medium_name : item.away.full_name }} @ {{  xs ? item.home.short_name : mdAndDown ? item.home.medium_name : item.home.full_name }}
                    </v-list-item>
                </template>
            </v-virtual-scroll>
            
        </v-list>
    </v-container>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'
import axios from 'axios'
import { SplitflapState } from '@/App.vue'
import type { Ref } from 'vue'
import isPwa from '@/isPwa'

const app = getCurrentInstance()
const splitflap: Ref<SplitflapState> = app!.root.exposed!.splitflap

const { xs, mdAndDown } = useDisplay()

type League = 'nhl' | 'nfl' | 'mlb' | 'nba'
type Team = {
    full_name: string,
    medium_name: string,
    short_name: string,
    score: number
}
type Game = {
    id: number,
    status: string,
    date: string,
    type: string,
    home: Team,
    away: Team
}

const scoreMode = ref<'column' | 'row'>('column')

const league = ref<League>(localStorage.getItem('league') as League | null || 'nhl')
const loading = ref(true)
const scores = ref<Array<Game>>([])

const selectLeague = (_league: League) => {
    league.value = _league
    localStorage.setItem('league', league.value)
    loadScores()
}

const selectGame = async (gameId: number) => {
    return axios.post(`/api/scores/${league.value}/${gameId}?mode=${scoreMode.value}`)
}

let interval: null | number = null

const loadScores = async () => {
    scores.value = []
    loading.value = true
    scores.value = await axios.get('/api/scores/' + league.value).then((res) => res.data)
    loading.value = false
    if (interval !== null)
        clearInterval(interval)
    interval = setInterval(async () => {
        loading.value = true
        scores.value = await axios.get('/api/scores/' + league.value).then((res) => res.data)
        loading.value = false
    }, 10000)
}

onUnmounted(() => {
    if (interval !== null)
        clearInterval(interval)
})

loadScores()
</script>
