<script setup lang="ts">
import { t } from '~/i18n'
import { computed } from 'vue'
import { currentMode } from '~/logic/mode'

/**
 * 模式标题组件
 * 根据当前游戏模式显示对应的SVG标题
 */

/**
 * 计算当前游戏模式
 * @returns {string} 当前模式：'endless' 或 'daily'
 */
const currentGameMode = computed((): string => {
  return currentMode.value
})
</script>

<template>
  <div class="mode-title">
    <h2 v-if="currentGameMode === 'endless'" text-2xl mt6 mb0 class="mode-title-text">
      <b>{{ t('endless-mode') }}</b>
    </h2>

    <h2 v-else-if="currentGameMode === 'daily'" text-2xl mt6 mb0 class="mode-title-text">
      <b>{{ t('daily-mode') }}</b>
    </h2>
  </div>
</template>

<style scoped>
.mode-title {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.mode-title-text {
  font-family: 
    "狮尾加糖宋体SC-Light", 
    "Swei Sugar Song SC Light",
    "Noto Serif SC", 
    "Source Han Serif SC", 
    "思源宋体", 
    serif;
  font-weight: 300;
  background: var(--color-tone-7);
  border: 1px solid var(--color-tone-4);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  min-width: 300px;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .mode-title-text {
    background: var(--color-tone-8);
    border-color: var(--color-tone-3);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mode-title-text {
    font-size: 1.25rem;
    letter-spacing: 0.03em;
  }
}
</style>
