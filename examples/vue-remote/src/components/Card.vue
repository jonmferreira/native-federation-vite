<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <div class="nf-card">
    <h3>{{ title ?? 'Federated card' }}</h3>
    <slot />
  </div>
</template>

<style scoped>
.nf-card {
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}
</style>
