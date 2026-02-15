<script setup lang="ts">
</script>

<template>
  <footer class="footer">
    <p>
      Données issues de
      <a href="https://ballxpit.net" target="_blank" rel="noopener noreferrer">ballxpit.net</a>
      &amp;
      <a href="https://ballxpit.wiki.gg" target="_blank" rel="noopener noreferrer">ballxpit.wiki.gg</a>
      — BALL x PIT © Kenny Sun / Devolver Digital
    </p>
  </footer>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.footer {
  text-align: center;
  padding: 30px 20px;
  color: var(--text-muted);
  font-size: 0.8rem;
  border-top: 1px solid var(--border);
  margin-top: 40px;

  a {
    color: var(--accent-secondary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
