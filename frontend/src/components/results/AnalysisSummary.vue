<script setup lang="ts">
import type { StatusAnalysis, BiomeSynergyResult, CharacterHint, PassiveBallSynergy } from '@/types'

defineProps<{
  statusAnalysis: StatusAnalysis
  biomeSynergy: BiomeSynergyResult | null
  characterHints: CharacterHint[]
  passiveBallSynergies: PassiveBallSynergy[]
}>()
</script>

<template>
  <div class="analysis-section">
    <h3 class="section-subtitle"><span class="icon">🧠</span> Analyse Intelligente</h3>
    <div class="analysis-grid">
      <!-- Status Effect Profile -->
      <div v-if="statusAnalysis.dominant.length > 0" class="analysis-card">
        <h4 class="analysis-title">📊 Profil de Statut</h4>
        <div class="effect-tags">
          <span v-for="eff in statusAnalysis.dominant" :key="eff" class="effect-tag">
            {{ eff }} <small>×{{ statusAnalysis.profile[eff] }}</small>
          </span>
        </div>
        <div v-if="statusAnalysis.suggestion" class="analysis-suggestion">
          💡 {{ statusAnalysis.suggestion }}
        </div>
        <div
          v-if="statusAnalysis.enhancing_evolutions?.length"
          class="analysis-enhance"
        >
          🔬 Évolutions synergiques :
          <strong v-for="(e, i) in statusAnalysis.enhancing_evolutions" :key="e">
            {{ e }}{{ i < statusAnalysis.enhancing_evolutions!.length - 1 ? ', ' : '' }}
          </strong>
        </div>
      </div>

      <!-- Biome Synergy -->
      <div v-if="biomeSynergy" class="analysis-card">
        <h4 class="analysis-title">🌍 Synergies Biome</h4>
        <p class="analysis-desc">{{ biomeSynergy.desc }}</p>
        <div class="biome-effects">
          <div v-if="biomeSynergy.strong.length">
            ✅ Efficace :
            <span v-for="s in biomeSynergy.strong" :key="s" class="effect-tag strong">{{ s }}</span>
          </div>
          <div v-if="biomeSynergy.weak.length">
            ❌ Résisté :
            <span v-for="w in biomeSynergy.weak" :key="w" class="effect-tag weak">{{ w }}</span>
          </div>
        </div>
      </div>

      <!-- Character Hints -->
      <div v-for="ch in characterHints" :key="ch.name" class="analysis-card char-card">
        <h4 class="analysis-title">🎮 {{ ch.name }}</h4>
        <p class="analysis-desc">{{ ch.desc }}</p>
        <div v-if="ch.goodBalls.length" class="char-hint-row">
          <span class="char-hint-label">✅ Synergiques :</span>
          <span v-for="b in ch.goodBalls" :key="b" class="effect-tag strong">{{ b }}</span>
        </div>
        <div v-if="ch.badBalls.length" class="char-hint-row">
          <span class="char-hint-label">⚠️ Sous-optimales :</span>
          <span v-for="b in ch.badBalls" :key="b" class="effect-tag weak">{{ b }}</span>
          <small v-if="ch.antiReason" class="char-anti-reason">{{ ch.antiReason }}</small>
        </div>
        <div v-if="ch.idealBalls.length" class="char-hint-row">
          <span class="char-hint-label">🎯 Balles idéales à trouver :</span>
          <span v-for="b in ch.idealBalls" :key="b" class="effect-tag">{{ b }}</span>
        </div>
      </div>

      <!-- Passive↔Ball Synergies -->
      <div v-if="passiveBallSynergies.length" class="analysis-card syn-card">
        <h4 class="analysis-title">🔗 Synergies Passif ↔ Balle</h4>
        <div class="syn-list">
          <div
            v-for="(syn, i) in passiveBallSynergies"
            :key="i"
            class="syn-item"
            :class="syn.active ? 'active' : 'potential'"
          >
            <span class="syn-tier" :class="`tier-${syn.tier.toLowerCase()}`">{{ syn.tier }}</span>
            <div class="syn-body">
              <span class="syn-reason">{{ syn.reason }}</span>
              <div class="syn-passives">🛡️ {{ syn.ownedPassives.join(', ') }}</div>
              <span v-if="syn.matchedBalls.length" class="syn-matched">
                🎱 {{ syn.matchedBalls.join(', ') }}
              </span>
              <span v-if="syn.suggestedBalls.length" class="syn-suggest">
                💡 Ajoute : {{ syn.suggestedBalls.join(', ') }}
              </span>
              <span v-if="syn.suggestedPassives.length" class="syn-suggest">
                🛡️ Cherche : {{ syn.suggestedPassives.join(', ') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.section-subtitle {
  @include section-title;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.analysis-card {
  @include card-style;
  padding: 16px;
}

.analysis-title {
  font-family: $font-display;
  font-size: 0.55rem;
  color: var(--accent-secondary);
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.analysis-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.effect-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.effect-tag {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  background: var(--bg-input);
  color: var(--text-secondary);
  border: 1px solid var(--border);

  &.strong {
    color: var(--success);
    border-color: var(--success);
    background: rgba(52, 211, 153, 0.1);
  }

  &.weak {
    color: var(--danger);
    border-color: var(--danger);
    background: rgba(239, 68, 68, 0.1);
  }

  small {
    opacity: 0.7;
    margin-left: 2px;
  }
}

.analysis-suggestion {
  font-size: 0.8rem;
  color: var(--warning);
  margin-top: 8px;
  padding: 8px;
  background: rgba(251, 191, 36, 0.08);
  border-radius: $radius-sm;
}

.analysis-enhance {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 6px;
}

.biome-effects {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.8rem;
}

.char-hint-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  margin-top: 6px;
  font-size: 0.75rem;
}

.char-hint-label {
  font-weight: 600;
  color: var(--text-muted);
  margin-right: 4px;
}

.char-anti-reason {
  display: block;
  width: 100%;
  color: var(--text-muted);
  font-size: 0.65rem;
  margin-top: 2px;
}

.syn-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.syn-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: $radius-sm;
  border: 1px solid var(--border);

  &.active { border-color: var(--success); background: rgba(52, 211, 153, 0.05); }
  &.potential { border-color: var(--border); background: var(--bg-input); }
}

.syn-tier {
  font-family: $font-display;
  font-size: 0.5rem;
  padding: 2px 6px;
  border-radius: 3px;
  align-self: flex-start;
  &.tier-s { color: var(--tier-s); }
  &.tier-a { color: var(--tier-a); }
  &.tier-b { color: var(--tier-b); }
}

.syn-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.75rem;
}

.syn-reason {
  font-weight: 600;
  color: var(--text-primary);
}

.syn-passives {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.syn-matched {
  color: var(--success);
  font-size: 0.7rem;
}

.syn-suggest {
  color: var(--warning);
  font-size: 0.65rem;
}
</style>
