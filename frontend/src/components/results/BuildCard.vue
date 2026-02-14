<script setup lang="ts">
import { computed } from 'vue'
import type { ScoredBuild } from '@/types'
import { useDataStore } from '@/stores/useDataStore'
import { statusLabel } from '@/composables/helpers'
import EntityImage from '@/components/shared/EntityImage.vue'
import TierBadge from '@/components/shared/TierBadge.vue'

const props = defineProps<{
  build: ScoredBuild
  rank: number
}>()

const data = useDataStore()

const rankEmoji = computed(() => {
  const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
  return emojis[props.rank] ?? ''
})

const tierClass = computed(() =>
  `tier-${props.build.tier.toLowerCase().replace('+', '-plus')}-card`
)

const difficultyClass = computed(() =>
  `diff-${(props.build.difficulty ?? '').toLowerCase().replace(/ /g, '-')}`
)

const hasRatings = computed(() =>
  props.build.dps_rating || props.build.survival_rating || props.build.skill_cap
)

interface RatingDef {
  label: string
  value: number
  max: number
  color: string
}

const ratings = computed<RatingDef[]>(() => {
  const items: RatingDef[] = []
  if (props.build.dps_rating) items.push({ label: 'DPS', value: props.build.dps_rating, max: 10, color: 'var(--danger)' })
  if (props.build.survival_rating) items.push({ label: 'Survie', value: props.build.survival_rating, max: 10, color: 'var(--success)' })
  if (props.build.skill_cap) items.push({ label: 'Difficulté', value: props.build.skill_cap, max: 10, color: 'var(--warning)' })
  return items
})

function ballEffect(name: string): string {
  const ball = data.ballsByName[name]
  return ball?.status_effect ? ` (${ball.status_effect})` : ''
}


</script>

<template>
  <div class="build-card" :class="tierClass">
    <!-- Header -->
    <div class="build-header">
      <span v-if="rankEmoji" class="build-rank">{{ rankEmoji }}</span>
      <span class="build-name">{{ build.name }}</span>
      <span v-if="build.subtitle" class="build-subtitle">{{ build.subtitle }}</span>
      <span class="build-archetype">{{ build.archetype }}</span>
      <TierBadge :tier="build.tier" />
      <span v-if="build.difficulty" class="difficulty-badge" :class="difficultyClass">
        {{ build.difficulty }}
      </span>
      <span class="build-score">Score: <strong>{{ build.score }}</strong></span>
    </div>

    <!-- Reasons -->
    <div v-if="build.reasons?.length" class="build-reasons">
      <span v-for="(r, i) in build.reasons" :key="i" class="reason-tag">✦ {{ r }}</span>
    </div>

    <!-- Ratings -->
    <div v-if="hasRatings" class="build-ratings">
      <div v-for="rating in ratings" :key="rating.label" class="rating-row">
        <span class="rating-label">{{ rating.label }}</span>
        <div class="rating-bar">
          <div
            class="rating-fill"
            :style="{ width: `${Math.round((rating.value / rating.max) * 100)}%`, background: rating.color }"
          />
        </div>
        <span class="rating-value">{{ rating.value }}/{{ rating.max }}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="build-body">
      <!-- Balls -->
      <div class="build-section">
        <span class="build-section-label">🎱 Balles</span>
        <div class="build-section-content">
          <div class="build-items">
            <span v-for="name in build.core_balls_list" :key="name" class="build-item">
              <EntityImage :src="build.balls_images[name]" :alt="name" fallback-emoji="⚪" />
              {{ name }}
              <small class="ball-effect-hint">{{ ballEffect(name) }}</small>
            </span>
          </div>
        </div>
      </div>

      <!-- Passives -->
      <div class="build-section">
        <span class="build-section-label">🛡️ Passifs</span>
        <div class="build-section-content">
          <div class="build-items">
            <span v-for="name in build.core_passives_list" :key="name" class="build-item">
              <EntityImage :src="build.passives_images[name]" :alt="name" fallback-emoji="🛡️" />
              {{ name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Roadmap -->
      <div v-if="build.roadmap?.length" class="build-section">
        <span class="build-section-label">🗺️ Roadmap</span>
        <div class="build-section-content">
          <div class="roadmap">
            <template v-for="(step, i) in build.roadmap" :key="i">
              <span v-if="i > 0" class="roadmap-arrow">→</span>
              <div v-if="step" class="roadmap-step" :class="step.status">
                <div class="roadmap-step-top">
                  <EntityImage :src="step.image" :alt="step.ball" fallback-emoji="⚪" />
                  <span class="step-name">{{ step.ball }}</span>
                  <span v-if="step.alt" class="chain-alt">(ou {{ step.alt }})</span>
                  <span class="roadmap-status" :class="step.status">{{ statusLabel(step.status) }}</span>
                </div>
                <!-- Children (ingredients) -->
                <div v-if="step.children?.length" class="chain-children">
                  <template v-for="(child, ci) in step.children" :key="ci">
                    <span v-if="ci > 0" class="chain-plus">+</span>
                    <div class="roadmap-step" :class="child.status" style="margin-left: 16px">
                      <EntityImage :src="child.image" :alt="child.ball" fallback-emoji="⚪" />
                      <span class="step-name">{{ child.ball }}</span>
                      <span v-if="child.alt" class="chain-alt">(ou {{ child.alt }})</span>
                      <span class="roadmap-status" :class="child.status">{{ statusLabel(child.status) }}</span>
                    </div>
                  </template>
                </div>
                <div v-if="step.tips" class="chain-tips">💡 {{ step.tips }}</div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div v-if="build.timeline" class="build-section">
        <span class="build-section-label">⏱️ Timeline</span>
        <div class="build-section-content">
          <div class="build-timeline">
            <div v-if="build.timeline.early" class="timeline-phase">
              <span class="phase-label early">Early</span>
              <span class="phase-desc">{{ build.timeline.early }}</span>
            </div>
            <div v-if="build.timeline.mid" class="timeline-phase">
              <span class="phase-label mid">Mid</span>
              <span class="phase-desc">{{ build.timeline.mid }}</span>
            </div>
            <div v-if="build.timeline.late" class="timeline-phase">
              <span class="phase-label late">Late</span>
              <span class="phase-desc">{{ build.timeline.late }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Strategy -->
      <div class="build-section">
        <span class="build-section-label">📋 Stratégie</span>
        <div class="build-section-content">
          <div class="build-strategy">{{ build.strategy }}</div>
        </div>
      </div>

      <!-- Pros / Cons -->
      <div v-if="build.pros?.length && build.cons?.length" class="build-pros-cons">
        <div class="build-pro-list">
          <span class="pros-label">✅ Forces</span>
          <div v-for="(p, i) in build.pros" :key="i" class="pro-item">+ {{ p }}</div>
        </div>
        <div class="build-con-list">
          <span class="cons-label">❌ Faiblesses</span>
          <div v-for="(c, i) in build.cons" :key="i" class="con-item">− {{ c }}</div>
        </div>
      </div>
      <div v-else-if="build.strengths || build.weaknesses" class="build-pros-cons">
        <div class="build-pro">✅ {{ build.strengths ?? 'N/A' }}</div>
        <div class="build-con">❌ {{ build.weaknesses ?? 'N/A' }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.build-card {
  @include card-style;
  overflow: hidden;
  animation: slideUp 0.4s ease;

  &.tier-s-plus-card { border-left: 4px solid var(--tier-s-plus); }
  &.tier-s-card { border-left: 4px solid var(--tier-s); }
  &.tier-a-card { border-left: 4px solid var(--tier-a); }
  &.tier-b-card { border-left: 4px solid var(--tier-b); }
  &.tier-c-card { border-left: 4px solid var(--tier-c); }
}

.build-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border);
}

.build-rank { font-size: 1.4rem; }

.build-name {
  font-family: $font-display;
  font-size: 0.7rem;
  color: var(--accent-primary);
}

.build-subtitle {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-style: italic;
}

.build-archetype {
  font-size: 0.65rem;
  color: var(--text-muted);
  padding: 2px 8px;
  background: var(--bg-tag);
  border-radius: $radius-sm;
}

.difficulty-badge {
  font-size: 0.55rem;
  padding: 2px 6px;
  border-radius: $radius-sm;
  font-family: $font-display;

  &.diff-facile { background: var(--success); color: #000; }
  &.diff-moyen { background: var(--warning); color: #000; }
  &.diff-difficile { background: var(--danger); color: #fff; }
  &.diff-expert { background: var(--tier-s-plus); color: #fff; }
}

.build-score {
  margin-left: auto;
  font-family: $font-display;
  font-size: 0.55rem;
  color: var(--accent-secondary);
}

// Reasons
.build-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border);
}

.reason-tag {
  font-size: 0.6rem;
  color: var(--accent-secondary);
}

// Ratings
.build-ratings {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid var(--border);
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-label {
  font-family: $font-display;
  font-size: 0.5rem;
  min-width: 60px;
  color: var(--text-secondary);
}

.rating-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-input);
  border-radius: 4px;
  overflow: hidden;
}

.rating-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.rating-value {
  font-size: 0.6rem;
  color: var(--text-muted);
  min-width: 30px;
  text-align: right;
}

// Body
.build-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.build-section-label {
  font-family: $font-display;
  font-size: 0.55rem;
  color: var(--accent-primary);
  display: block;
  margin-bottom: 6px;
}

.build-section-content {
  padding-left: 8px;
}

.build-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.build-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--bg-tag);
  border-radius: $radius-sm;
  font-size: 0.65rem;
  color: var(--text-primary);
}

.ball-effect-hint {
  font-size: 0.55rem;
  color: var(--text-muted);
}

// Roadmap
.roadmap {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
}

.roadmap-arrow {
  font-size: 1.2rem;
  color: var(--accent-primary);
  align-self: center;
}

.roadmap-step {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: var(--bg-tag);
  border-radius: $radius-sm;
  border-left: 3px solid var(--border);

  &.owned { border-left-color: var(--success); }
  &.ready { border-left-color: var(--success); }
  &.partial { border-left-color: var(--warning); }
  &.missing, &.pickup { border-left-color: var(--danger); }
}

.roadmap-step-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.step-name {
  font-size: 0.6rem;
  color: var(--text-primary);
}

.chain-alt {
  font-size: 0.5rem;
  color: var(--text-muted);
  font-style: italic;
}

.roadmap-status {
  font-family: $font-display;
  font-size: 0.4rem;
  padding: 2px 6px;
  border-radius: $radius-sm;
  color: #fff;

  &.owned { background: var(--success); color: #000; }
  &.ready { background: var(--success); color: #000; }
  &.partial { background: var(--warning); color: #000; }
  &.missing, &.pickup { background: var(--danger); }
}

.chain-children {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.chain-plus {
  font-weight: bold;
  color: var(--accent-secondary);
}

.chain-tips {
  font-size: 0.55rem;
  color: var(--accent-secondary);
  margin-top: 4px;
}

// Timeline
.build-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-phase {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.phase-label {
  font-family: $font-display;
  font-size: 0.45rem;
  padding: 2px 8px;
  border-radius: $radius-sm;
  white-space: nowrap;

  &.early { background: var(--success); color: #000; }
  &.mid { background: var(--warning); color: #000; }
  &.late { background: var(--danger); color: #fff; }
}

.phase-desc {
  font-size: 0.65rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

// Strategy
.build-strategy {
  font-size: 0.65rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

// Pros / Cons
.build-pros-cons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.pros-label, .cons-label {
  font-family: $font-display;
  font-size: 0.5rem;
  display: block;
  margin-bottom: 6px;
}

.pro-item {
  font-size: 0.6rem;
  color: var(--success);
  line-height: 1.6;
}

.con-item {
  font-size: 0.6rem;
  color: var(--danger);
  line-height: 1.6;
}

.build-pro, .build-con {
  font-size: 0.6rem;
  line-height: 1.6;
}

.build-pro { color: var(--success); }
.build-con { color: var(--danger); }
</style>
