import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDataStore } from './useDataStore'

export const useRunState = defineStore('runState', () => {
  const selectedCharacters = ref<string[]>([])
  const selectedBiome = ref<string | null>(null)
  const selectedBalls = ref<string[]>([])
  const selectedPassives = ref<string[]>([])
  const selectedStyle = ref<string | null>(null)

  function toggleCharacter(name: string): void {
    const dataStore = useDataStore()
    const idx = selectedCharacters.value.indexOf(name)

    if (idx >= 0) {
      selectedCharacters.value.splice(idx, 1)
    } else if (selectedCharacters.value.length < 2) {
      selectedCharacters.value.push(name)
      _addStartingBall(name, dataStore)
    } else {
      // Replace oldest
      selectedCharacters.value.shift()
      selectedCharacters.value.push(name)
      _addStartingBall(name, dataStore)
    }
  }

  function _addStartingBall(charName: string, dataStore: ReturnType<typeof useDataStore>): void {
    const char = dataStore.charactersByName[charName]
    if (char && !selectedBalls.value.includes(char.starting_ball)) {
      selectedBalls.value.push(char.starting_ball)
    }
  }

  function toggleBiome(name: string): void {
    selectedBiome.value = selectedBiome.value === name ? null : name
  }

  function toggleBall(name: string): void {
    const idx = selectedBalls.value.indexOf(name)
    if (idx >= 0) {
      selectedBalls.value.splice(idx, 1)
    } else {
      selectedBalls.value.push(name)
    }
  }

  function removeBall(name: string): void {
    selectedBalls.value = selectedBalls.value.filter(b => b !== name)
  }

  function togglePassive(name: string): void {
    const idx = selectedPassives.value.indexOf(name)
    if (idx >= 0) {
      selectedPassives.value.splice(idx, 1)
    } else {
      selectedPassives.value.push(name)
    }
  }

  function removePassive(name: string): void {
    selectedPassives.value = selectedPassives.value.filter(p => p !== name)
  }

  function setStyle(style: string): void {
    selectedStyle.value = selectedStyle.value === style ? null : style
  }

  function resetAll(): void {
    selectedCharacters.value = []
    selectedBiome.value = null
    selectedBalls.value = []
    selectedPassives.value = []
    selectedStyle.value = null
  }

  return {
    selectedCharacters,
    selectedBiome,
    selectedBalls,
    selectedPassives,
    selectedStyle,
    toggleCharacter,
    toggleBiome,
    toggleBall,
    removeBall,
    togglePassive,
    removePassive,
    setStyle,
    resetAll,
  }
})
