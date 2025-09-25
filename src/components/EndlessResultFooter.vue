<template>
  <div op50 my1 text-sm ws-nowrap text-center v-if="currentRound">
    {{ t('endless.result.round') }} #{{ currentRound.roundNumber }} ·
    {{ hintText }} ·
    {{ formatDuration(currentRound.duration || 0) }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { t } from '~/i18n'
import { currentRound, formatDuration } from '~/logic/endless'

/**
 * 提示文本计算
 */
const hintText = computed(() => {
  if (!currentRound.value) return ''
  
  // 检查是否使用了提示
  if (!currentRound.value.hint) {
    return t('hint-level-none')
  }
  
  // 根据提示等级显示
  if (currentRound.value.hintLevel === 1)
    return t('hint-level-1')
  else if (currentRound.value.hintLevel === 2)
    return t('hint-level-2')
  else
    return t('hint-level-1') // 默认显示一级提示
})
</script>

<style scoped>
/* 移除原有的复杂样式，使用与ResultFooter一致的简洁样式 */
</style>