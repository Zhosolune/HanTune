<script setup lang="ts">
import '~/init'
import { answer, dayNo, daySince, isDev } from '~/state'
import { colorblind } from '~/storage'
import { DAYS_PLAY_BACK } from '~/logic/constants'
import { currentMode, GameMode, setGameMode } from '~/logic/mode'
import GameModeSelector from '~/components/GameModeSelector.vue'
import IntroPage from '~/components/IntroPage.vue'

const { height } = useWindowSize()

// 首次访问状态管理
const hasVisited = useStorage('hantune-has-visited', false)
const showIntro = ref(!hasVisited.value)

watchEffect(() => {
  document.documentElement.style.setProperty('--vh', `${height.value / 100}px`)
})

const handleModeSelected = (mode: GameMode) => {
  setGameMode(mode)
}

const handleIntroComplete = () => {
  hasVisited.value = true
  showIntro.value = false
}
</script>

<template>
  <main font-sans text="center gray-700 dark:gray-300" select-none :class="{ colorblind }">
    <!-- 欢迎页面 -->
    <IntroPage 
      v-if="showIntro" 
      @intro-complete="handleIntroComplete" 
    />
    
    <!-- 模式选择界面 -->
    <GameModeSelector 
      v-else-if="!currentMode" 
      @mode-selected="handleModeSelected" 
    />
    
    <!-- 游戏界面 -->
    <template v-else>
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
  </main>
</template>
