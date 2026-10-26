<template>
  <div>
    <h1>Beatmapset {{ id }}</h1>
    <p v-if="loading">Loading...</p>
    <p v-if="error" class="muted">{{ error }}</p>
    <div v-if="data" class="card">
      <h2>{{ data.title }} - {{ data.artist }}</h2>
      <p class="muted">by {{ data.creator }}</p>
      <a :href="`https://osu.ppy.sh/beatmapsets/${id}`" target="_blank">Official page</a>
      <h3>Difficulties</h3>
      <div v-for="b in data.beatmaps" :key="b.id" class="card">
        <p>{{ b.version }} · {{ b.difficulty_rating }}★</p>
        <textarea v-model="files[b.id]" placeholder="Paste .osu file content here" rows="4"></textarea>
        <button @click="analyze(b.id)" :disabled="analyzing">Analyze</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id as string
const data = ref<any>(null)
const loading = ref(true)
const error = ref('')
const files = ref<Record<number,string>>({})
const analyzing = ref(false)
onMounted(async()=>{
  try { const r = await fetch(`/api/beatmapset/${id}`); if(!r.ok) throw new Error(await r.text()); data.value = await r.json() }
  catch(e:any){ error.value = e.message }
  finally { loading.value = false }
})
async function analyze(bid:number){
  analyzing.value = true
  try {
    const r = await fetch('/api/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content: files.value[bid] }) })
    const res = await r.json()
    sessionStorage.setItem('lastAnalysis', JSON.stringify(res))
    window.location.href = '/analysis'
  } catch(e:any){ error.value = e.message }
  finally { analyzing.value = false }
}
</script>
