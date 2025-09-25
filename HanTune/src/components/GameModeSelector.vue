<template>
  <div class="mode-selector">
    <div class="mode-selector-header">
      <h2>选择游戏模式</h2>
      <p>选择你喜欢的游戏模式开始挑战</p>
    </div>
    
    <div class="mode-cards">
      <div 
        class="mode-card"
        :class="{ active: selectedMode === 'daily' }"
        @click="selectMode('daily')"
      >
        <div class="mode-icon">📅</div>
        <h3>每日一词</h3>
        <p>每天一个固定成语，与全球玩家同步挑战</p>
        <div class="mode-features">
          <span class="feature">✓ 每日更新</span>
          <span class="feature">✓ 全球同步</span>
          <span class="feature">✓ 分享结果</span>
        </div>
      </div>
      
      <div 
        class="mode-card"
        :class="{ active: selectedMode === 'endless' }"
        @click="selectMode('endless')"
      >
        <div class="mode-icon">♾️</div>
        <h3>无尽模式</h3>
        <p>无限挑战随机成语，提升你的成语水平</p>
        <div class="mode-features">
          <span class="feature">✓ 无限挑战</span>
          <span class="feature">✓ 随机成语</span>
          <span class="feature">✓ 统计记录</span>
        </div>
      </div>
    </div>
    
    <div class="mode-actions">
      <button 
        class="start-button"
        :disabled="!selectedMode"
        @click="startGame"
      >
        开始游戏
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GameMode } from '~/logic/mode'

const emit = defineEmits<{
  modeSelected: [mode: GameMode]
}>()

const selectedMode = ref<GameMode | null>(null)

const selectMode = (mode: GameMode) => {
  selectedMode.value = mode
}

const startGame = () => {
  if (selectedMode.value) {
    emit('modeSelected', selectedMode.value)
  }
}
</script>

<style scoped>
.mode-selector {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.mode-selector-header {
  margin-bottom: 3rem;
}

.mode-selector-header h2 {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-tone-1);
  margin-bottom: 0.5rem;
}

.mode-selector-header p {
  font-size: 1.1rem;
  color: var(--color-tone-2);
  opacity: 0.8;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.mode-card {
  background: var(--color-background);
  border: 2px solid var(--color-tone-4);
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.mode-card:hover {
  border-color: var(--color-correct);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.mode-card.active {
  border-color: var(--color-correct);
  background: linear-gradient(135deg, var(--color-correct) 0%, var(--color-correct) 100%);
  color: white;
}

.mode-card.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
}

.mode-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.mode-card h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: inherit;
}

.mode-card p {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.mode-features {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature {
  font-size: 0.9rem;
  opacity: 0.7;
  text-align: left;
}

.mode-card.active .feature {
  opacity: 0.9;
}

.mode-actions {
  margin-top: 2rem;
}

.start-button {
  background: var(--color-correct);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.start-button:hover:not(:disabled) {
  background: var(--color-correct-dark, #4ade80);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.start-button:disabled {
  background: var(--color-tone-4);
  color: var(--color-tone-2);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mode-selector {
    padding: 1rem;
  }
  
  .mode-selector-header h2 {
    font-size: 2rem;
  }
  
  .mode-cards {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .mode-card {
    padding: 1.5rem;
  }
  
  .start-button {
    width: 100%;
    padding: 1rem 2rem;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .mode-card {
    background: var(--color-tone-7);
    border-color: var(--color-tone-3);
  }
  
  .mode-card:hover {
    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
  }
}
</style>