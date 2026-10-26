<template>
  <div>
    <h1>Analysis Result</h1>
    <div v-if="result" class="card">
      <h2>Score: {{ result.score }} / 100</h2>
      <p class="muted">{{ result.algorithmVersion }}</p>
      <h3>Metrics</h3>
      <ul>
        <li v-for="(v,k) in result.metrics" :key="k">{{ k }}: {{ v }}</li>
      </ul>
      <h3>Events ({{ result.events.length }})</h3>
      <ul><li v-for="(e,i) in result.events.slice(0,50)" :key="i">{{ e.type }} {{ e.startTime }}-{{ e.endTime }}</li></ul>
      <h3>Warnings</h3>
      <ul><li v-for="(w,i) in result.warnings" :key="i">{{ w }}</li></ul>
    </div>
    <p v-else class="muted">No analysis loaded.</p>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const result = ref<any>(null)
onMounted(()=>{ const r = sessionStorage.getItem('lastAnalysis'); if(r) result.value = JSON.parse(r) })
</script>
