<template>
  <div>
    <h1>Patternholic</h1>
    <p class="muted">Discover osu! beatmaps and analyze rhythm patterns. Pattern Abuse Score 0-100.</p>
    <div class="card">
      <input v-model="q" @keyup.enter="go" placeholder="Search beatmaps..." />
      <button @click="go" :disabled="!q">Search</button>
    </div>
    <p class="muted">No analyses yet. Analyze a beatmap to see rankings.</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const q = ref('')
const router = useRouter()
function go(){ if(q.value) router.push({path:'/search', query:{q:q.value}}) }
</script>
