<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ label?: string }>()
const clicks = ref(0)
</script>

<template>
  <button class="fed-btn" @click="clicks++">
    {{ label ?? 'Web Component' }} ({{ clicks }})
  </button>
</template>

<!-- `.ce.vue` → plugin-vue compiles this in custom-element mode, so these
     styles are injected into the element's shadow DOM. -->
<style>
.fed-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #42b883;
  background: #42b883;
  color: white;
  font: inherit;
  cursor: pointer;
}
.fed-btn:hover {
  background: #369268;
}
</style>
