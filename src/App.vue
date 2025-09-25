<script setup lang="ts">
import '~/init'
import { answer, dayNo, daySince, isDev, showIntro } from '~/state'
import { colorblind, initialized, firstVisit } from '~/storage'
import { DAYS_PLAY_BACK } from '~/logic/constants'
import { currentMode, GameMode, setGameMode } from '~/logic/mode'
import GameModeSelector from '~/components/GameModeSelector.vue'

const { height } = useWindowSize()

// 初始化页面显示逻辑
watchEffect(() => {
  if (firstVisit.value && !initialized.value) {
    showIntro.value = true
  }
})

watchEffect(() => {
  document.documentElement.style.setProperty('--vh', `${height.value / 100}px`)
})

const handleModeSelected = (mode: GameMode) => {
  setGameMode(mode)
}

const showWelcome = () => {
  // 重新显示IntroPage
  showIntro.value = true
}

// 提供showWelcome函数给子组件使用
provide('showWelcome', showWelcome)
</script>

<template>
  <main font-sans text="center gray-700 dark:gray-300" select-none :class="{ colorblind }">
    <!-- 模式选择界面 -->
    <GameModeSelector 
      v-if="!currentMode && initialized" 
      @mode-selected="handleModeSelected" 
    />
    
    <!-- 游戏界面 -->
    <template v-else-if="initialized">
      <NotTodayBanner v-if="currentMode === 'daily' && dayNo < daySince" />
      <Navbar />
      <div p="4">
        <NoQuizToday v-if="currentMode === 'daily' && !answer.word" />
        <NoFuturePlay v-else-if="currentMode === 'daily' && dayNo > daySince && !isDev" />
        <NoPastPlay v-else-if="currentMode === 'daily' && daySince - dayNo > DAYS_PLAY_BACK && !isDev" />
        <Play v-else />
      </div>
      <ModalsLayer />
      <Confetti />
    </template>
    
    <!-- 未初始化时显示ModalsLayer管理的页面 -->
    <template v-else>
      <ModalsLayer />
    </template>
  </main>
</template>
