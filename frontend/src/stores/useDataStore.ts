import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Character, Ball, Passive, Biome, Evolution, Build } from '@/types'

export const useDataStore = defineStore('data', () => {
  // ─── State ───
  const characters = ref<Character[]>([])
  const balls = ref<Ball[]>([])
  const passives = ref<Passive[]>([])
  const biomes = ref<Biome[]>([])
  const evolutions = ref<Evolution[]>([])
  const builds = ref<Build[]>([])
  const loaded = ref(false)

  // ─── Computed indexes ───
  const ballsByName = computed(() => {
    const map: Record<string, Ball> = {}
    for (const b of balls.value) {
      map[b.name] = b
    }
    return map
  })

  const passivesByName = computed(() => {
    const map: Record<string, Passive> = {}
    for (const p of passives.value) {
      map[p.name] = p
    }
    return map
  })

  const charactersByName = computed(() => {
    const map: Record<string, Character> = {}
    for (const c of characters.value) {
      map[c.name] = c
    }
    return map
  })

  const evosByResult = computed(() => {
    const map: Record<string, Evolution> = {}
    for (const e of evolutions.value) {
      map[e.result_ball] = e
    }
    return map
  })

  const evosByIngredient = computed(() => {
    const map: Record<string, Evolution[]> = {}
    for (const e of evolutions.value) {
      const keys: (keyof Evolution)[] = ['ingredient_1', 'ingredient_2', 'ingredient_3', 'ingredient_1_alt', 'ingredient_2_alt']
      for (const key of keys) {
        const ing = e[key]
        if (ing && typeof ing === 'string') {
          if (!Object.prototype.hasOwnProperty.call(map, ing)) {
            map[ing] = []
          }
          map[ing]!.push(e)
        }
      }
    }
    return map
  })

  const baseBalls = computed(() => balls.value.filter(b => b.is_base_ball))
  const evoBalls = computed(() => balls.value.filter(b => b.is_evolution))
  const basePassives = computed(() => passives.value.filter(p => !p.is_evolution))
  const evoPassives = computed(() => passives.value.filter(p => p.is_evolution))

  // ─── Actions ───
  async function loadAll(): Promise<void> {
    const [chars, b, p, bio, evo, bld] = await Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/characters.json`).then(r => r.json()),
      fetch(`${import.meta.env.BASE_URL}data/balls.json`).then(r => r.json()),
      fetch(`${import.meta.env.BASE_URL}data/passives.json`).then(r => r.json()),
      fetch(`${import.meta.env.BASE_URL}data/biomes.json`).then(r => r.json()),
      fetch(`${import.meta.env.BASE_URL}data/evolutions.json`).then(r => r.json()),
      fetch(`${import.meta.env.BASE_URL}data/builds.json`).then(r => r.json()),
    ])
    characters.value = chars
    balls.value = b
    passives.value = p
    biomes.value = bio
    evolutions.value = evo
    builds.value = bld
    loaded.value = true
  }

  return {
    characters,
    balls,
    passives,
    biomes,
    evolutions,
    builds,
    loaded,
    ballsByName,
    passivesByName,
    charactersByName,
    evosByResult,
    evosByIngredient,
    baseBalls,
    evoBalls,
    basePassives,
    evoPassives,
    loadAll,
  }
})
