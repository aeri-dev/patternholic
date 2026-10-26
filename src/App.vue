<template>
  <div class="app">
    <nav class="nav">
      <RouterLink to="/" class="brand">Patternholic</RouterLink>
      <div class="links">
        <RouterLink to="/search">Search</RouterLink>
        <RouterLink to="/rankings">Rankings</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </div>
    </nav>
    <main class="main"><RouterView /></main>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped>
.nav { display:flex; justify-content:space-between; align-items:center; padding:1rem 2rem; background:#0b1324; border-bottom:1px solid #1e2a45; }
.brand { color:#60a5fa; font-weight:700; font-size:1.25rem; text-decoration:none; }
.links a { color:#cbd5e1; margin-left:1rem; text-decoration:none; }
.links a.router-link-active { color:#60a5fa; }
.main { padding:2rem; max-width:1100px; margin:0 auto; }
</style>
