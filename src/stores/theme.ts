import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref<boolean>(true)

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      isDark.value = true
    } else if (savedTheme === 'light') {
      isDark.value = false
    } else {
      // Default to dark mode based on initial style logic
      isDark.value = true
    }
    applyTheme()
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  const applyTheme = () => {
    if (isDark.value) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }

  return {
    isDark,
    initTheme,
    toggleTheme
  }
})
