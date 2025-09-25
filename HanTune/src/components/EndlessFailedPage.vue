<script setup lang="ts">
import { showEndlessFailed, endlessGameState } from '~/state'
import { t } from '~/i18n'

/**
 * 继续挑战 - 复用每日模式的继续挑战逻辑
 */
function continueChallenge() {
  showEndlessFailed.value = false
  // 重置失败选择状态，允许用户继续输入
  endlessGameState.value.showFailedChoice = false
  endlessGameState.value.showAnswer = false
}

/**
 * 显示答案 - 显示正确答案和再来一词按钮
 */
function showAnswer() {
  showEndlessFailed.value = false
  endlessGameState.value.showFailedChoice = false
  endlessGameState.value.showAnswer = true
}
</script>

<template>
  <div p5 flex="~ col center">
    <div i-carbon-face-dizzy text-5xl op50 m4 />
    <div>
      {{ t('failed-1') }}<br><br>
      {{ t('failed-2') }}<br>
      {{ t('failed-3') }}
    </div>
    <div p4 flex="~ gap-5 center">
      <button btn @click="continueChallenge">
        {{ t('continue') }}
      </button>
      <button icon-btn flex="inline gap-1 center" text="base mis!" @click="showAnswer">
        <div i-mdi-emoticon-devil-outline /> {{ t('view-answer') }}
      </button>
    </div>
  </div>
</template>