import { createWebHashHistory, createRouter } from 'vue-router'

import HomeView from './routes/HomeView.vue'
import ManualView from './routes/ManualView.vue'
import QueueView from './routes/QueueView.vue'
import ScoreboardView from './routes/ScoreboardView.vue'
import SpotifyView from './routes/SpotifyView.vue'

const routes = [
    { name: 'manual', path: '/manual', component: ManualView},
    { name: 'queue', path: '/queue', component: QueueView },
    { name: 'scoreboard', path: '/scoreboard', component: ScoreboardView },
    { name: 'spotify', path: '/spotify', component: SpotifyView },
    { name: 'home', path: '/:pathMatch(.*)*', component: HomeView },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router