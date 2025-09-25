<script setup lang="ts">
import '~/init'
import { answer, dayNo, daySince, isDev, showHelp } from '~/state'
import { colorblind, initialized } from '~/storage'
import { DAYS_PLAY_BACK } from '~/logic/constants'
import { currentMode, GameMode, setGameMode } from '~/logic/mode'
import GameModeSelector from '~/components/GameModeSelector.vue'
import IntroPage from '~/components/IntroPage.vue'
import Modal from '~/components/Modal.vue'

const { height } = useWindowSize()

// 欢迎界面状态管理 - 根据initialized状态决定是否显示IntroPage
const showIntro = computed(() => !initialized.value)

watchEffect(() => {
  document.documentElement.style.setProperty('--vh', `${height.value / 100}px`)
})

const handleModeSelected = (mode: GameMode) => {
  setGameMode(mode)
}

const handleIntroComplete = () => {
  // IntroPage完成后，显示WelcomePage（规则介绍）
  showHelp.value = true
}

const showWelcome = () => {
  // 重新显示IntroPage
  initialized.value = false
}

// 提供showWelcome函数给子组件使用
provide('showWelcome', showWelcome)
</script>

<template>
  <main font-sans text="center gray-700 dark:gray-300" select-none :class="{ colorblind }">
    <!-- 项目介绍页面 -->
    <Modal v-model="showIntro" direction="top" :mask="false" @update:model-value="handleIntroComplete">
      <IntroPage @intro-complete="handleIntroComplete" />
    </Modal>
    
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
  </main>
</template>
