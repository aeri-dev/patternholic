<template>
  <div>
    <h1>Rankings</h1>
    <p v-if="loading">Loading...</p>
    <table v-if="items.length">
      <thead><tr><th>Beatmap ID</th><th>Version</th><th>Score</th></tr></thead>
      <tbody><tr v-for="(r,i) in items" :key="i"><td>{{ r.beatmap_id }}</td><td>{{ r.version }}</td><td>{{ r.score }}</td></tr></tbody>
    </table>
    <p v-if="!loading && items.length===0" class="muted">No analyses yet.</p>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const items = ref<any[]>([])
const loading = ref(true)
onMounted(async()=>{ try { const r = await fetch('/api/rankings'); const d = await r.json(); items.value = d.items || [] } finally { loading.value = false } })
</script>
