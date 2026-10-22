<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ label?: string }>()
const clicks = ref(0)
</script>

<template>
  <button class="nf-button" @click="clicks++">
    {{ label ?? 'Click me' }} ({{ clicks }})
  </button>
</template>

<style scoped>
.nf-button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #42b883;
  background: #42b883;
  color: white;
  cursor: pointer;
}
</style>
