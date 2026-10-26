<template>
  <div>
    <h1>Search</h1>
    <input v-model="q" @keyup.enter="search" placeholder="query" />
    <button @click="search" :disabled="loading">Search</button>
    <p v-if="error" class="muted">{{ error }}</p>
    <p v-if="loading">Loading...</p>
    <div v-for="s in results" :key="s.id" class="card">
      <h3>{{ s.title }} - {{ s.artist }}</h3>
      <p class="muted">by {{ s.creator }} · {{ s.beatmaps?.length || 0 }} difficulties</p>
      <RouterLink :to="`/beatmap/${s.id}`">View</RouterLink>
    </div>
    <p v-if="!loading && results.length===0" class="muted">No results.</p>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const q = ref((route.query.q as string) || '')
const results = ref<any[]>([])
const loading = ref(false)
const error = ref('')
async function search(){
  loading.value = true; error.value = ''
  try {
    const r = await fetch(`/api/search?q=${encodeURIComponent(q.value)}`)
    if(!r.ok) throw new Error(await r.text())
    const data = await r.json()
    results.value = data.beatmapsets || []
  } catch(e:any){ error.value = e.message }
  finally { loading.value = false }
}
onMounted(()=>{ if(q.value) search() })
</script>
