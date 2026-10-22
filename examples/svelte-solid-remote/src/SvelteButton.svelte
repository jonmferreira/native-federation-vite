<script>
  let { label = 'Svelte' } = $props()
  let count = $state(0)
</script>

<button onclick={() => count++}>{label} ({count})</button>

<style>
  button {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: 1px solid #ff3e00;
    background: #ff3e00;
    color: white;
    cursor: pointer;
  }
</style>
