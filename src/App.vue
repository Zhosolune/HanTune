<script setup lang="ts">
import '~/init'
import { answer, dayNo, daySince, isDev } from '~/state'
import { colorblind } from '~/storage'
import { DAYS_PLAY_BACK } from '~/logic/constants'
import { currentMode, GameMode, setGameMode } from '~/logic/mode'
import GameModeSelector from '~/components/GameModeSelector.vue'
import IntroPage from '~/components/IntroPage.vue'
import Modal from '~/components/Modal.vue'

const { height } = useWindowSize()

// 欢迎界面状态管理
const showIntro = ref(true)

watchEffect(() => {
  document.documentElement.style.setProperty('--vh', `${height.value / 100}px`)
})

const handleModeSelected = (mode: GameMode) => {
  setGameMode(mode)
}

const handleIntroComplete = () => {
  showIntro.value = false
}

const showWelcome = () => {
  showIntro.value = true
}

// 提供showWelcome函数给子组件使用
provide('showWelcome', showWelcome)
</script>

<template>
  <main font-sans text="center gray-700 dark:gray-300" select-none :class="{ colorblind }">
    <!-- 欢迎页面 -->
    <Modal v-model="showIntro" direction="top" :mask="false" @update:model-value="handleIntroComplete">
      <IntroPage @intro-complete="handleIntroComplete" />
    </Modal>
    
    <!-- 模式选择界面 -->
    <GameModeSelector 
      v-if="!currentMode && !showIntro" 
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
