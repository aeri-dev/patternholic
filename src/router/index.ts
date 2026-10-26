import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Search from '@/views/Search.vue'
import BeatmapDetail from '@/views/BeatmapDetail.vue'
import Analysis from '@/views/Analysis.vue'
import Rankings from '@/views/Rankings.vue'
import About from '@/views/About.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/search', component: Search },
    { path: '/beatmap/:id', component: BeatmapDetail },
    { path: '/analysis', component: Analysis },
    { path: '/rankings', component: Rankings },
    { path: '/about', component: About }
  ]
})
export default router
