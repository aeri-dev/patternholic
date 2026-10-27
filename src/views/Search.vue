<template>
  <div class="page">
    <header class="page-header">
      <p class="eyebrow">The beatmap library</p>
      <h1 class="page-title">Find your next pattern.</h1>
      <p class="page-description">Search by song, artist, or mapper. Pick a difficulty and see what makes it tick.</p>
    </header>

    <form class="search-form" role="search" @submit.prevent="search">
      <label class="sr-only" for="beatmap-search">Search beatmaps</label>
      <div class="search-field">
        <AppIcon name="search" class="search-icon"/>
        <input
            id="beatmap-search"
            v-model="q"
            class="search-input"
            type="search"
            placeholder="Song, artist, or mapper…"
            autocomplete="off"
        />
      </div>
      <button class="button button-primary search-button" type="submit" :disabled="loading || !q.trim()">
        {{ loading ? 'Searching…' : 'Search beatmaps' }}
        <AppIcon name="arrow-right"/>
      </button>
    </form>

    <p v-if="error" class="status-message status-message--error" role="alert">{{ error }}</p>

    <div v-if="loading" class="loading-state" role="status">
      <AppIcon name="activity"/>
      <p>Finding beatmaps…</p>
    </div>

    <section v-else-if="results.length" class="search-results" aria-label="Search results">
      <div class="section-heading">
        <h2>Search results</h2>
        <p class="result-count">{{ results.length }} beatmapsets</p>
      </div>
      <article v-for="beatmapset in results" :key="beatmapset.id" class="result-card">
        <div class="result-main">
          <p class="result-meta">{{ beatmapset.artist }}</p>
          <h3 class="result-title">
            <RouterLink :to="`/beatmap/${beatmapset.id}`">{{ beatmapset.title }}</RouterLink>
          </h3>
          <p class="result-meta">
            Mapped by {{ beatmapset.creator }}
            <span aria-hidden="true"> · </span>
            {{ beatmapset.beatmaps?.length || 0 }} difficulties
          </p>
        </div>
        <RouterLink class="text-link result-action" :to="`/beatmap/${beatmapset.id}`"
                    :aria-label="`Explore ${beatmapset.title}`">
          Explore
          <AppIcon name="arrow-up-right"/>
        </RouterLink>
      </article>
    </section>

    <div v-else-if="searched && !error" class="empty-state" role="status">
      <AppIcon name="search" class="empty-state-icon"/>
      <h2>No matching beatmaps.</h2>
      <p>Try a different song, artist, or mapper name.</p>
    </div>

    <div v-else-if="!error" class="empty-state">
      <AppIcon name="layers" class="empty-state-icon"/>
      <h2>A good pattern starts with a good map.</h2>
      <p>Search the osu! library above, then choose a beatmap to explore.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'

interface Beatmapset {
  id: number
  title: string
  artist: string
  creator: string
  beatmaps?: { id: number }[]
}

const route = useRoute()
const q = ref(typeof route.query.q === 'string' ? route.query.q : '')
const results = ref<Beatmapset[]>([])
const loading = ref(false)
const searched = ref(false)
const error = ref('')

async function search() {
  const query = q.value.trim()
  if (!query || loading.value) return

  loading.value = true
  error.value = ''
  results.value = []

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await response.json().catch(() => null)
    if (!response.ok || !data) {
      throw new Error(data?.error || 'Beatmap search is unavailable right now. Please try again shortly.')
    }
    results.value = data.beatmapsets || []
  } catch (cause) {
    error.value = cause instanceof Error && cause.message !== 'Failed to fetch'
        ? cause.message
        : 'Could not connect to beatmap search. Please try again.'
  } finally {
    searched.value = true
    loading.value = false
  }
}

onMounted(() => {
  if (q.value.trim()) search()
})
</script>
