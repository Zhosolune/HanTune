<script setup lang="ts">
import { isDark, showDashboard, showEndlessDashboard, showHelp, showSettings, useMask } from '~/state'
import { gamesCount } from '~/storage'
import { currentMode, setGameMode } from '~/logic/mode'
import { getEndlessStats } from '~/logic/endless'

const toggleDark = useToggle(isDark)
const toggleSettings = useToggle(showSettings)

// 注入showWelcome函数
const showWelcome = inject('showWelcome') as (() => void) | undefined

function toggleDashboard() {
  if (currentMode.value === 'endless') {
    showEndlessDashboard.value = !showEndlessDashboard.value
  } else {
    showDashboard.value = !showDashboard.value
  }
}

function openHelp() {
  showHelp.value = true
  useMask.value = false
}

async function toggleGameMode() {
  const newMode = currentMode.value === 'daily' ? 'endless' : 'daily'
  await setGameMode(newMode)
}

// 计算是否显示计分板按钮
const shouldShowDashboard = computed(() => {
  if (currentMode.value === 'endless') {
    return getEndlessStats().totalRounds > 0
  } else {
    return gamesCount.value > 0
  }
})
</script>

<template>
  <nav border="b base" relative>
    <div absolute font-serif text-2xl left-0 right-0 top-0 bottom-0 z--1 tracking-2 flex>
      <AppName ma />
    </div>
    <div flex items-center justify-between md:max-w-md ma py4 px2>
      <div flex items-center>
        <button v-if="showWelcome" icon-btn mx2 @click="showWelcome()" title="查看项目信息">
          <div i-carbon-information />
        </button>
        <button icon-btn mx2 @click="openHelp()">
          <div i-carbon-help />
        </button>
        <button v-if="shouldShowDashboard" icon-btn mx2 @click="toggleDashboard()">
          <div i-carbon-catalog />
        </button>
      </div>
      <div flex items-center>
        <button icon-btn mx2 @click="toggleGameMode()" :title="currentMode === 'daily' ? '切换到无尽模式' : '切换到每日模式'">
          <div i-carbon-switcher />
        </button>
        <button icon-btn mx2 @click="toggleSettings()">
          <div i-carbon-settings />
        </button>
        <button icon-btn mx2 @click="toggleDark()">
          <div i-carbon-sun dark:i-carbon-moon />
        </button>
      </div>
    </div>
  </nav>
</template>
