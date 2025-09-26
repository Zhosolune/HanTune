<template>
  <div p5 flex="~ col center" relative>
    <div absolute top-4 right-4 flex="~ gap-3">
      <button icon-btn @click="close">
        <div i-carbon-close />
      </button>
    </div>

    <p text-xl font-serif mb2>
      <b>{{ t('endless.dashboard.title') }}</b>
    </p>
    
    <div flex="~ wrap gap-4" justify-center min-w-100px py2>
      <DashboardItem 
        :text="t('endless.dashboard.totalRounds')" 
        :value="stats.totalRounds.toString()" 
      />
      <DashboardItem 
        :text="t('endless.dashboard.successRate')" 
        :value="`${stats.successRate}%`" 
      />
      <DashboardItem 
        :text="t('endless.dashboard.averageAttempts')" 
        :value="stats.averageAttempts.toString()" 
      />
      <DashboardItem 
        :text="t('endless.dashboard.averageDuration')" 
        :value="stats.averageDuration" 
      />
    </div>
    
    <div flex="~ wrap gap-4" justify-center min-w-100px py2>
      <DashboardItem 
        :text="t('endless.dashboard.bestStreak')" 
        :value="stats.bestStreak.toString()" 
      />
      <DashboardItem 
        :text="t('endless.dashboard.currentStreak')" 
        :value="stats.currentStreak.toString()" 
      />
    </div>

    <div class="session-info" v-if="currentSession && currentSession.isActive">
      <h4 text-lg font-serif mb2 text-center>{{ t('endless.dashboard.currentSession') }}</h4>
      <div flex="~ wrap gap-4" justify-center min-w-100px py2>
        <DashboardItem 
          :text="t('endless.dashboard.sessionRounds')" 
          :value="currentSession.totalRounds.toString()" 
        />
        <DashboardItem 
          :text="t('endless.dashboard.sessionPassed')" 
          :value="currentSession.passedRounds.toString()" 
        />
        <DashboardItem 
          :text="t('endless.dashboard.sessionStreak')" 
          :value="currentSession.currentStreak.toString()" 
        />
      </div>
    </div>

    <div class="actions" pt4>
      <button 
        class="reset-btn" 
        @click="handleReset"
        :disabled="!canReset"
        px4 py2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed
      >
        {{ t('endless.dashboard.resetStats') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DashboardItem from './DashboardItem.vue'
import { t } from '~/i18n'
import { showEndlessDashboard } from '~/state'
import { 
  getEndlessDetailedStats, 
  currentEndlessSession, 
  resetEndlessData,
  isEndlessSessionActive
} from '~/logic/endless'

/**
 * 获取无尽模式详细统计数据
 */
const stats = computed(() => getEndlessDetailedStats())

/**
 * 当前会话信息
 */
const currentSession = computed(() => currentEndlessSession.value)

/**
 * 是否可以重置统计数据（当前没有活跃会话时才能重置）
 */
const canReset = computed(() => !isEndlessSessionActive.value)

/**
 * 关闭计分板
 */
function close() {
  showEndlessDashboard.value = false
}

/**
 * 处理重置统计数据
 */
function handleReset() {
  if (canReset.value && confirm(t('endless.dashboard.resetConfirm'))) {
    resetEndlessData()
  }
}
</script>

<style scoped>
.session-info {
  width: 100%;
  max-width: 400px;
  margin: 1rem 0;
}

.actions {
  text-align: center;
}
</style>