<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch, watchEffect } from 'vue'
import { debouncedRef } from '@vueuse/core'
import { answer, endlessAnswer, endlessHint, endlessTries, endlessMeta, dailyIsPassed, dailyIsFailed, dailyIsFinished, endlessIsPassed, endlessIsFailed, endlessIsFinished, showHint, showCheatSheet, showHelp, showEndlessFailed, endlessGameState, endlessIsPlaying } from '~/state'
import { isEndlessMode } from '~/logic/mode'
import { currentEndlessSession, startEndlessSession, startNewRound, currentRound, addAttempt, completeRound, getEndlessStats } from '~/logic/endless'
import { getRandomIdiom } from '~/logic/randomIdiom'
import { getHint } from '~/logic/utils'
import { WORD_LENGTH, TRIES_LIMIT } from '~/logic/constants'
import { checkValidIdiom, filterNonChineseChars } from '~/logic/check'
import { tries, meta, markStart, useNoHint } from '~/storage'
import { t } from '~/i18n'
import EndlessResultFooter from './EndlessResultFooter.vue'

const el = ref<HTMLInputElement>()
const input = ref('')
const inputValue = ref('')
const showToast = autoResetRef(false, 1000)
const shake = autoResetRef(false, 500)

// 无尽模式状态 - 移除重复定义，使用全局状态
const showNextButton = ref(false)

// 使用全局状态，不再需要本地状态和 provide

const isFinishedDelay = debouncedRef(computed(() => 
  isEndlessMode.value ? endlessIsFinished.value : dailyIsFinished.value
), 800)

// 初始化无尽模式
onMounted(() => {
  if (isEndlessMode.value) {
    if (!currentEndlessSession.value) {
      startEndlessSession()
    }
    
    if (!currentRound.value) {
      console.log('开始新轮次 - 调用 getRandomIdiom()')
      const [newIdiom, hint] = getRandomIdiom()
      console.log('开始新轮次 - newIdiom:', newIdiom, 'hint:', hint)
      endlessAnswer.value = newIdiom
      endlessHint.value = hint
      console.log('开始新轮次 - endlessAnswer.value:', endlessAnswer.value)
      console.log('开始新轮次 - endlessHint.value:', endlessHint.value)
      
      // 确保会话已激活后再开始新轮次
      if (currentEndlessSession.value?.isActive) {
        startNewRound(newIdiom)
      } else {
        // 如果会话未激活，重新启动会话并开始新轮次
        startEndlessSession()
        startNewRound(newIdiom)
      }
      
      // 设置无尽模式为游戏进行中状态
      endlessIsPlaying.value = true
    } else {
      console.log('恢复现有轮次 - currentRound.value.answer:', currentRound.value.answer)
      endlessAnswer.value = currentRound.value.answer
      // 为现有轮次生成提示字符
      endlessHint.value = getHint(currentRound.value.answer)
      console.log('恢复现有轮次 - endlessAnswer.value:', endlessAnswer.value)
      console.log('恢复现有轮次 - endlessHint.value:', endlessHint.value)
      endlessTries.value = currentRound.value.attempts
      
      // 恢复现有轮次时，设置为游戏进行中状态
      endlessIsPlaying.value = true
    }
  }
})

// 计算当前答案（每日模式或无尽模式）
const currentAnswer = computed(() => {
  return isEndlessMode.value ? endlessAnswer.value : answer.value.word
})

// 计算当前使用的tries（每日模式或无尽模式）
const currentTries = computed(() => {
  return isEndlessMode.value ? endlessTries.value : tries.value
})

// 计算当前使用的meta（每日模式或无尽模式）
const currentMeta = computed(() => {
  return isEndlessMode.value ? endlessMeta.value : meta.value
})

// 计算是否完成（基于当前模式的独立状态）
const isCurrentFinished = computed(() => {
  if (isEndlessMode.value) {
    // 在无尽模式下，优先使用猜对状态，避免与显示答案状态冲突
    if (endlessIsPassed.value) {
      return true
    }
    // 只有在未猜对的情况下，才考虑显示失败选择或显示答案状态
    return endlessGameState.value.showFailedChoice || endlessGameState.value.showAnswer
  }
  // 每日模式使用独立的每日状态
  return dailyIsPassed.value
})

// 计算是否失败（基于当前模式的独立状态）
const isCurrentFailed = computed(() => {
  if (isEndlessMode.value) {
    return endlessIsFailed.value
  }
  return dailyIsFailed.value
})

function enter() {
  if (input.value.length !== WORD_LENGTH)
    return
  if (!checkValidIdiom(input.value, false)) {
    showToast.value = true
    shake.value = true
    return false
  }
  if (meta.value.strict == null)
    meta.value.strict = false
  
  if (isEndlessMode.value) {
    // 无尽模式：使用独立状态
    endlessTries.value.push(input.value)
    
    // 检查是否正确
    const isCorrect = input.value === endlessAnswer.value
    const isFailed = endlessTries.value.length >= TRIES_LIMIT && !isCorrect
    
    // 记录尝试到无尽模式会话
    if (currentRound.value) {
      addAttempt(input.value)
      
      if (isCorrect || isFailed) {
        // 获取提示等级
        const hintLevel = endlessMeta.value.hintLevel || 0
        const usedHint = !!endlessMeta.value.hint
        
        // 完成轮次，传递提示信息
        completeRound(isCorrect, usedHint, hintLevel)
        
        // 更新无尽模式游戏状态（但不影响每日模式）
        endlessGameState.value.isFinished = isCorrect
        endlessGameState.value.isFailed = isFailed
        
        // 猜对或失败后，设置为非游戏进行中状态（等待用户选择是否继续）
        endlessIsPlaying.value = false
        
        // 显示失败选择界面
        if (isFailed) {
          showEndlessFailed.value = true
        }
      }
    }
  } else {
    // 每日模式：使用原有逻辑
    tries.value.push(input.value)
    markStart()
  }
  
  input.value = ''
  inputValue.value = ''
}

function nextWord() {
  // 确保有活跃的无尽模式会话
  if (!currentEndlessSession.value?.isActive) {
    startEndlessSession()
  }
  
  // 清除当前轮次（在开始新轮次前）
  if (currentEndlessSession.value) {
    currentEndlessSession.value.currentRound = undefined
  }
  
  // 重置无尽模式状态
  endlessTries.value = []
  endlessMeta.value = { hint: false }
  input.value = ''
  inputValue.value = ''
  showNextButton.value = false
  
  // 重置全局状态
  endlessGameState.value.isFinished = false
  endlessGameState.value.isFailed = false
  endlessGameState.value.currentTries = []
  endlessGameState.value.showFailedChoice = false
  endlessGameState.value.showAnswer = false
  showEndlessFailed.value = false
  
  // 生成新的成语并开始新轮次
  const [newIdiom, hint] = getRandomIdiom()
  endlessAnswer.value = newIdiom
  endlessHint.value = hint
  endlessGameState.value.currentAnswer = newIdiom
  startNewRound(newIdiom)
  
  // 用户选择继续游戏，设置为游戏进行中状态
  endlessIsPlaying.value = true
  
  // 重新聚焦输入框
  nextTick(() => {
    focus()
  })
}

function handleInput(e: Event) {
  const el = (e.target! as HTMLInputElement)
  input.value = filterNonChineseChars(el.value).slice(0, 4)
  markStart()
}
function focus() {
  el.value?.focus()
}
function hint() {
  if (isEndlessMode.value) {
    endlessMeta.value.hint = true
    if (!endlessMeta.value.hintLevel)
      endlessMeta.value.hintLevel = 1
  } else {
    meta.value.hint = true
    if (!meta.value.hintLevel)
      meta.value.hintLevel = 1
  }
  showHint.value = true
}
function sheet() {
  showCheatSheet.value = !showCheatSheet.value
}

watchEffect(() => {
  if (!showHelp.value)
    focus()
})

watchEffect(() => {
  if (isCurrentFailed.value) {
    if (isEndlessMode.value) {
      if (!endlessMeta.value.failed) {
        endlessMeta.value.failed = true
        // 无尽模式失败后显示选择界面
        endlessGameState.value.showFailedChoice = true
      }
    } else {
      if (!meta.value.failed) {
        meta.value.failed = true
        setTimeout(() => {
          showEndlessFailed.value = true
        }, 1200)
      }
    }
  }
})

// 监听模式切换，确保切换到无尽模式时正确初始化
watch(isEndlessMode, async (newMode) => {
  if (newMode) {
    // 切换到无尽模式时，确保有正确的答案和提示
    if (!endlessAnswer.value) {
      console.log('模式切换 - 初始化无尽模式答案')
      
      // 先确保会话已激活
      if (!currentEndlessSession.value?.isActive) {
        startEndlessSession()
        // 等待下一个 tick 确保响应式更新完成
        await nextTick()
      }
      
      const [newIdiom, hint] = getRandomIdiom()
      console.log('模式切换 - newIdiom:', newIdiom, 'hint:', hint)
      endlessAnswer.value = newIdiom
      endlessHint.value = hint
      
      // 确保会话激活后再开始新轮次
      if (!currentRound.value && currentEndlessSession.value?.isActive) {
        startNewRound(newIdiom)
        // 切换到无尽模式并开始新游戏时，设置为游戏进行中状态
        endlessIsPlaying.value = true
      }
    } else {
      // 如果已有答案，说明是恢复游戏，设置为游戏进行中状态
      endlessIsPlaying.value = true
    }
  } else {
    // 切换离开无尽模式时，设置为非游戏进行中状态
    endlessIsPlaying.value = false
  }
})
</script>

<template>
  <div>
    <div flex="~ col"  items-center>
      <!-- 无尽模式信息栏 -->
      <div v-if="isEndlessMode" class="endless-info" mb4>
        <div class="round-info">
          <span class="round-label">{{ t('endless.round-count', currentRound?.roundNumber || 1) }}</span>
          <span class="stats-info">
            {{ t('endless.correct', getEndlessStats().totalCorrect) }} |
            {{ t('endless.total-count', getEndlessStats().totalRounds) }}
          </span>
        </div>
      </div>

      <WordBlocks v-for="w, i of currentTries" :key="i" :word="w" :revealed="true"
        :answer="isEndlessMode ? endlessAnswer : undefined" @click="focus()" />

      <template v-if="(currentMeta.answer && !dailyIsPassed) || (isEndlessMode && endlessGameState.showAnswer && !endlessIsPassed)">
        <div my4>
          <div font-serif p2>
            {{ t('correct-answer') }}
          </div>
          <WordBlocks :word="currentAnswer" />
        </div>
      </template>

      <WordBlocks v-if="!isCurrentFinished" :class="{ shake }" :word="input" :active="true" @click="focus()" />

      <div mt-1 />

      <Transition name="fade-out">
        <div v-if="!isCurrentFinished" flex="~ col gap-2" items-center>
          <div relative border="2 base rounded-0">
            <input ref="el" v-model="inputValue" bg-transparent w-86 p3 outline-none text-center type="text"
              autocomplete="false" :placeholder="t('input-placeholder')" :disabled="isCurrentFinished"
              :class="{ shake }" @input="handleInput" @keydown.enter="enter">
            <div absolute top-0 left-0 right-0 bottom-0 flex="~ center" bg-base transition-all duration-300 text-mis
              pointer-events-none :class="showToast ? '' : 'op0 translate-y--1'">
              <span tracking-1 pl1>
                {{ t('invalid-idiom') }}
              </span>
            </div>
          </div>
          <button mt3 btn p="x6 y2" :disabled="input.length !== WORD_LENGTH" @click="enter">
            {{ t('ok-spaced') }}
          </button>
          <div v-if="currentTries.length > 4 && !isCurrentFailed" op50>
            {{ t('tries-rest', TRIES_LIMIT - currentTries.length) }}
          </div>
          <button v-if="!isEndlessMode && isCurrentFailed" square-btn @click="showEndlessFailed = true">
            <div i-mdi-emoticon-devil-outline /> {{ t('view-answer') }}
          </button>

          <div flex="~ center" mt4 :class="isCurrentFinished ? 'op0! pointer-events-none' : ''">
            <button v-if="!useNoHint" mx2 icon-btn text-base pb2 gap-1 flex="~ center" @click="hint()">
              <div i-carbon-idea /> {{ t('hint') }}
            </button>
            <button mx2 icon-btn text-base pb2 gap-1 flex="~ center" @click="sheet()">
              <div i-carbon-grid /> {{ t('cheatsheet') }}
            </button>
          </div>
        </div>
      </Transition>

      <!-- 无尽模式完成后的操作 -->
      <Transition name="fade-in">
        <!-- 无尽模式完成界面（统一处理成功和显示答案状态） -->
        <div v-if="isEndlessMode && isCurrentFinished" class="endless-complete-interface" flex="~ col center">
          <!-- 显示无尽模式结果信息 -->
          <EndlessResultFooter />
          
          <!-- 分享和再来一词按钮 -->
          <div flex="~ center gap-4" mt4 mb4>
            <ShareButton />
            <button btn flex="~ wrap gap-x-2 center" ws-nowrap text-lg font-serif p="x3 y1" @click="nextWord">
              再来一词
            </button>
          </div>
          
          <!-- 遮罩切换按钮 -->
          <ToggleMask :hint="true" />
        </div>
      </Transition>

      <!-- 每日模式完成后的操作 -->
      <Transition name="fade-in">
        <div v-if="!isEndlessMode && isFinishedDelay && dailyIsFinished">
          <ResultFooter />
          <Countdown />
        </div>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
.endless-info {
  background: var(--color-tone-7);
  border: 1px solid var(--color-tone-4);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  min-width: 300px;
}

.round-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.round-label {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--color-tone-1);
}

.stats-info {
  font-size: 0.9rem;
  color: var(--color-tone-2);
  opacity: 0.8;
}

.endless-result {
  text-align: center;
  padding: 1rem;
}

.success-message {
  color: var(--color-correct);
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.failed-message {
  color: var(--color-absent);
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.next-word-btn {
  background: var(--c-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-word-btn:hover {
  background: var(--c-primary-deep);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .endless-info {
    min-width: auto;
    width: 100%;
    max-width: 350px;
  }
  
  .round-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stats-info {
    font-size: 0.8rem;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .endless-info {
    background: var(--color-tone-8);
    border-color: var(--color-tone-3);
  }
}
</style>
