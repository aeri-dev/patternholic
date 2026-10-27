<template>
  <svg
      class="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
  >
    <path :d="paths[name]"/>
  </svg>
</template>

<script setup lang="ts">
const paths = {
  search: 'M21 21l-5-5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0',
  'arrow-right': 'M4 12h16m-6-6 6 6-6 6',
  'arrow-up-right': 'M6 18 18 6M6 6h12v12',
  activity: 'M2 12h4l3-8 6 16 3-8h4',
  chart: 'M4 4v16h16M8 15v-4m5 4V7m5 8v-6',
  layers: 'm12 3 10 6-10 6L2 9l10-6ZM2 13l10 6 10-6M2 17l10 6 10-6',
  file: 'M14 2H5v20h14V7l-5-5Zm0 0v6h5M8 13h8m-8 4h5',
  info: 'M12 11v6m0-10v.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  'chevron-right': 'm9 5 7 7-7 7',
  check: 'm5 12 4 4L19 6',
} as const

defineProps<{ name: keyof typeof paths }>()
</script>
