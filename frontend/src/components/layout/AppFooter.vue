<template>
  <footer class="app-footer">
    <p>
      Données issues de
      <a href="https://ballxpit.net" target="_blank" rel="noopener">ballxpit.net</a> &amp;
      <a href="https://ballxpit.wiki.gg" target="_blank" rel="noopener">ballxpit.wiki.gg</a>
      — BALL x PIT © Kenny Sun / Devolver Digital
    </p>
    <p class="footer-sources">
      Autres ressources :
      <a href="https://store.steampowered.com/app/2062430/BALL_x_PIT/" target="_blank" rel="noopener">Steam</a> ·
      <a href="https://steamcommunity.com/app/2062430/guides/" target="_blank" rel="noopener">Steam Guides</a> ·
      <a href="https://www.ign.com/wikis/ball-x-pit" target="_blank" rel="noopener">IGN</a> ·
      <a href="https://www.dexerto.com/wikis/ball-x-pit/" target="_blank" rel="noopener">Dexerto</a> ·
      <a href="https://gamerant.com/ball-x-pit-evolutions-tier-list-best-balls/" target="_blank" rel="noopener">Game Rant</a>
    </p>
  </footer>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.app-footer {
  text-align: center;
  padding: 30px 20px;
  color: var(--text-muted);
  font-size: 0.75rem;
  border-top: 1px solid var(--border);
  margin-top: 40px;

  a {
    color: var(--accent-secondary, #7dd3fc);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.footer-sources {
  font-size: 0.85em;
  margin-top: 6px;
  opacity: 0.8;
}
</style>
