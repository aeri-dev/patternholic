<template>
  <div class="page">
    <header class="page-header">
      <RouterLink class="text-link" to="/search">Back to beatmap search</RouterLink>
      <p class="eyebrow">Beatmapset / {{ id }}</p>
      <h1 class="page-title">{{ data?.title || 'Explore the beatmap.' }}</h1>
      <p v-if="data" class="page-description">{{ data.artist }} <span aria-hidden="true">·</span> Mapped by
        {{ data.creator }}</p>
      <p v-else class="page-description">Choose a difficulty to take a closer look at its patterns.</p>
    </header>

    <div v-if="loading" class="loading-state" role="status">
      <AppIcon name="activity"/>
      <p>Loading beatmap details…</p>
    </div>

    <div v-else-if="error" class="status-message status-message--error" role="alert">
      <p>{{ error }}</p>
      <button class="button button-secondary" type="button" @click="loadBeatmap">Try again</button>
    </div>

    <div v-else-if="data" class="section-stack">
      <div class="detail-header">
        <div>
          <h2>Choose a difficulty</h2>
          <p class="muted">Paste its .osu file below to analyze jumps, streams, and more.</p>
        </div>
        <a class="button button-secondary" :href="`https://osu.ppy.sh/beatmapsets/${id}`" target="_blank"
           rel="noopener noreferrer">
          Open on osu!
          <AppIcon name="arrow-up-right"/>
        </a>
      </div>

      <div v-if="data.beatmaps?.length" class="difficulty-list">
        <form v-for="beatmap in data.beatmaps" :key="beatmap.id" class="panel difficulty-card"
              @submit.prevent="analyze(beatmap.id)">
          <div class="difficulty-header">
            <h3>{{ beatmap.version }}</h3>
            <span class="badge">{{ beatmap.difficulty_rating }} ★</span>
          </div>
          <label class="field-label" :for="`osu-content-${beatmap.id}`">Beatmap file content</label>
          <textarea
              :id="`osu-content-${beatmap.id}`"
              v-model="files[beatmap.id]"
              class="code-input"
              :aria-describedby="`osu-hint-${beatmap.id}`"
              placeholder="osu file format v14…"
              rows="6"
              spellcheck="false"
              :readonly="analyzing !== null"
          ></textarea>
          <div class="form-actions">
            <p :id="`osu-hint-${beatmap.id}`" class="field-hint">Open the difficulty's .osu file in a text editor and
              paste its full contents.</p>
            <button class="button button-primary" type="submit"
                    :disabled="analyzing !== null || !files[beatmap.id]?.trim()">
              {{ analyzing === beatmap.id ? 'Analyzing…' : 'Analyze pattern' }}
              <AppIcon name="arrow-right"/>
            </button>
          </div>
          <p v-if="analysisError?.id === beatmap.id" class="status-message status-message--error" role="alert">
            {{ analysisError.message }}</p>
        </form>
      </div>

      <div v-else class="empty-state">
        <AppIcon name="file" class="empty-state-icon"/>
        <h2>No difficulties available.</h2>
        <p>Visit the official osu! page for more information about this beatmapset.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'

interface Beatmapset {
  title: string
  artist: string
  creator: string
  beatmaps: { id: number; version: string; difficulty_rating: number }[]
}

const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))
const data = ref<Beatmapset | null>(null)
const loading = ref(true)
const error = ref('')
const files = ref<Record<number, string>>({})
const analyzing = ref<number | null>(null)
const analysisError = ref<{ id: number; message: string } | null>(null)

async function loadBeatmap() {
  loading.value = true
  error.value = ''
  data.value = null

  try {
    const response = await fetch(`/api/beatmapset/${id.value}`)
    const result = await response.json().catch(() => null)
    if (!response.ok || !result) {
      throw new Error(result?.error || 'This beatmap could not be loaded. Please try again.')
    }
    data.value = result
  } catch (cause) {
    error.value = cause instanceof Error && cause.message !== 'Failed to fetch'
        ? cause.message
        : 'Could not connect to the beatmap library. Please try again.'
  } finally {
    loading.value = false
  }
}

async function analyze(beatmapId: number) {
  const content = files.value[beatmapId]
  if (!content?.trim() || analyzing.value !== null) return

  analyzing.value = beatmapId
  analysisError.value = null

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({content}),
    })
    const result = await response.json().catch(() => null)
    if (!response.ok || !result) {
      throw new Error(result?.error || 'The analysis could not be completed. Please try again.')
    }
    sessionStorage.setItem('lastAnalysis', JSON.stringify(result))
    await router.push('/analysis')
  } catch (cause) {
    analysisError.value = {
      id: beatmapId,
      message: cause instanceof Error && cause.message !== 'Failed to fetch'
          ? cause.message
          : 'Could not connect to the analyzer. Please try again.',
    }
  } finally {
    analyzing.value = null
  }
}

watch(id, loadBeatmap, {immediate: true})
</script>
