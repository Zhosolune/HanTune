<template>
  <div class="endless-dashboard">
    <div class="dashboard-header">
      <h3>{{ t('endless.dashboard.title') }}</h3>
      <p class="dashboard-subtitle">{{ t('endless.dashboard.subtitle') }}</p>
    </div>
    
    <div class="stats-grid">
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
      <DashboardItem 
        :text="t('endless.dashboard.bestStreak')" 
        :value="stats.bestStreak.toString()" 
      />
      <DashboardItem 
        :text="t('endless.dashboard.currentStreak')" 
        :value="stats.currentStreak.toString()" 
      />
    </div>

    <div class="session-info" v-if="currentSession">
      <h4>{{ t('endless.dashboard.currentSession') }}</h4>
      <div class="session-stats">
        <span>{{ t('endless.dashboard.sessionRounds') }}: {{ currentSession.totalRounds }}</span>
        <span>{{ t('endless.dashboard.sessionPassed') }}: {{ currentSession.passedRounds }}</span>
        <span>{{ t('endless.dashboard.sessionStreak') }}: {{ currentSession.currentStreak }}</span>
      </div>
    </div>

    <div class="actions">
      <button 
        class="reset-btn" 
        @click="handleReset"
        :disabled="!canReset"
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
 * 处理重置统计数据
 */
function handleReset() {
  if (canReset.value && confirm(t('endless.dashboard.resetConfirm'))) {
    resetEndlessData()
  }
}
</script>

<style scoped>
.endless-dashboard {
  padding: 1rem;
  background: var(--color-bg-secondary);
  border-radius: 8px;
  margin: 1rem 0;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.dashboard-header h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
  font-size: 1.25rem;
}

.dashboard-subtitle {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.session-info {
  background: var(--color-bg-primary);
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.session-info h4 {
  margin: 0 0 0.75rem 0;
  color: var(--color-text-primary);
  font-size: 1rem;
}

.session-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.actions {
  text-align: center;
}

.reset-btn {
  background: var(--color-danger);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: opacity 0.2s;
}

.reset-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .session-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>