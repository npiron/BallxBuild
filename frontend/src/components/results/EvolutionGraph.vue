<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EvolutionGraphData, GraphNode } from '@/types'
import EntityImage from '@/components/shared/EntityImage.vue'
import TierBadge from '@/components/shared/TierBadge.vue'

const props = defineProps<{
  graph: EvolutionGraphData
}>()

const activeNode = ref<string | null>(null)

const connectedNodes = computed(() => {
  const connected = new Set<string>()
  if (!activeNode.value) return connected
  for (const edge of props.graph.edges) {
    if (edge.from === activeNode.value || edge.to === activeNode.value) {
      connected.add(edge.from === activeNode.value ? edge.to : edge.from)
    }
  }
  return connected
})

const ownedNodes = computed(() => props.graph.nodes.filter(n => n.status === 'owned'))
const readyNodes = computed(() => props.graph.nodes.filter(n => n.status === 'ready'))
const oneAwayNodes = computed(() => props.graph.nodes.filter(n => n.status === 'one-away'))
const partialNodes = computed(() => props.graph.nodes.filter(n => n.status === 'partial'))
const neededNodes = computed(() => props.graph.nodes.filter(n => n.status === 'needed'))

interface LayerDef {
  nodes: GraphNode[]
  label: string
  icon: string
}

const layers = computed<LayerDef[]>(() => [
  { nodes: ownedNodes.value, label: 'Possédées', icon: '🟢' },
  { nodes: readyNodes.value, label: 'Prêtes à Fusionner', icon: '⚡' },
  { nodes: oneAwayNodes.value, label: '1 Balle Manquante', icon: '🟡' },
  { nodes: partialNodes.value, label: 'Partiellement Atteignables', icon: '🟠' },
  { nodes: neededNodes.value, label: 'Ingrédients à Trouver', icon: '🔴' },
].filter(l => l.nodes.length > 0))

function toggleNode(ballId: string): void {
  activeNode.value = activeNode.value === ballId ? null : ballId
}

function nodeClass(node: GraphNode): Record<string, boolean> {
  return {
    [`graph-${node.status}`]: true,
    'graph-active': activeNode.value === node.id,
    'graph-connected': connectedNodes.value.has(node.id),
  }
}
</script>

<template>
  <div v-if="graph.nodes.length" class="evo-graph-section">
    <h3 class="section-subtitle"><span class="icon">🌐</span> Graphe d'Évolution</h3>
    <p class="section-hint">Toutes les évolutions accessibles depuis tes balles — regroupées par proximité</p>
    <div class="graph-container">
      <div v-for="layer in layers" :key="layer.label" class="graph-layer">
        <div class="graph-layer-label">
          {{ layer.icon }} {{ layer.label }}
          <span class="graph-count">({{ layer.nodes.length }})</span>
        </div>
        <div class="graph-layer-nodes">
          <div
            v-for="node in layer.nodes"
            :key="node.id"
            class="graph-node"
            :class="nodeClass(node)"
            :title="node.id"
            @click="toggleNode(node.id)"
          >
            <EntityImage :src="node.image" :alt="node.id" fallback-emoji="⚪" />
            <span class="graph-label">{{ node.label }}</span>
            <TierBadge v-if="node.tier" :tier="node.tier" />
            <span v-if="node.missing?.length" class="graph-missing">
              +{{ node.missing.join(', +') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.section-subtitle { @include section-title; }

.section-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.graph-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.graph-layer-label {
  font-family: $font-display;
  font-size: 0.55rem;
  color: var(--text-muted);
  letter-spacing: 1px;
  margin-bottom: 8px;

  .graph-count {
    color: var(--accent-secondary);
  }
}

.graph-layer-nodes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.graph-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: $radius-sm;
  cursor: pointer;
  transition: all $transition;
  min-width: 70px;
  max-width: 90px;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--border-glow);
  }

  &.graph-owned {
    border-color: var(--success);
    background: rgba(52, 211, 153, 0.05);
  }

  &.graph-ready {
    border-color: var(--success);
    animation: readyPulse 2s infinite;
  }

  &.graph-one-away {
    border-color: var(--warning);
    background: rgba(251, 191, 36, 0.05);
  }

  &.graph-partial {
    border-color: var(--tier-s);
    background: rgba(255, 107, 53, 0.05);
  }

  &.graph-needed {
    border-color: var(--danger);
    opacity: 0.7;
  }

  &.graph-active {
    box-shadow: 0 0 16px var(--accent-glow);
    border-color: var(--accent-primary);
    transform: scale(1.05);
  }

  &.graph-connected {
    border-color: var(--accent-secondary);
    box-shadow: 0 0 8px var(--accent-glow);
    background: var(--bg-selected);
  }
}

.graph-label {
  font-size: 0.5rem;
  text-align: center;
  color: var(--text-secondary);
  line-height: 1.2;
}

.graph-missing {
  font-size: 0.45rem;
  color: var(--danger);
  text-align: center;
}
</style>
