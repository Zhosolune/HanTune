/**
 * 游戏模式管理模块
 * 负责处理每日模式和无尽模式的切换和状态管理
 */

// 游戏模式类型定义
export type GameMode = 'daily' | 'endless'

// 模式状态接口
export interface ModeState {
  currentMode: GameMode
  isTransitioning: boolean
  lastModeSwitch: number
}

// 使用 localStorage 持久化模式状态
export const gameMode = useStorage<GameMode>('hantune-game-mode', 'daily')
export const modeState = useStorage<ModeState>('hantune-mode-state', {
  currentMode: 'daily',
  isTransitioning: false,
  lastModeSwitch: 0
})

// 确保状态正确初始化
if (!gameMode.value) {
  gameMode.value = 'daily'
}
if (!modeState.value) {
  modeState.value = {
    currentMode: 'daily',
    isTransitioning: false,
    lastModeSwitch: 0
  }
}

// 响应式计算属性
export const isDailyMode = computed(() => gameMode.value === 'daily')
export const isEndlessMode = computed(() => gameMode.value === 'endless')

/**
 * 切换游戏模式
 * @param mode 目标模式
 * @param force 是否强制切换（忽略过渡状态）
 */
export async function switchGameMode(mode: GameMode, force = false) {
  console.log('switchGameMode - 开始切换，当前模式:', gameMode.value, '目标模式:', mode, '强制:', force)
  
  if (gameMode.value === mode && !force) {
    console.log('switchGameMode - 相同模式，不切换')
    return
  }

  // 防止频繁切换（500ms内只能切换一次）
  const now = Date.now()
  if (!force && now - modeState.value.lastModeSwitch < 500) {
    console.log('switchGameMode - 切换太频繁，跳过')
    return
  }

  console.log('switchGameMode - 开始切换流程')
  // 设置过渡状态
  modeState.value.isTransitioning = true
  
  // 切换模式前重置相关状态
  if (mode === 'endless') {
    // 切换到无尽模式时，检查是否正在游戏中
    const { endlessIsPlaying } = await import('~/state')
    
    // 只有当无尽模式不在游戏进行中时才重置状态
    if (!endlessIsPlaying.value) {
      // 可以选择性地重置无尽模式状态
      // 这里不自动重置，让用户保持之前的游戏进度
    }
  } else if (mode === 'daily') {
    // 切换到每日模式时，不需要重置每日模式状态，因为它们是基于日期的
    // 但需要确保无尽模式的UI状态被清理
    const { showEndlessFailed } = await import('~/state')
    showEndlessFailed.value = false
  }
  
  // 切换模式
  gameMode.value = mode
  modeState.value.currentMode = mode
  modeState.value.lastModeSwitch = now

  // 延迟清除过渡状态
  setTimeout(() => {
    modeState.value.isTransitioning = false
    console.log('switchGameMode - 过渡状态清除，切换完成')
  }, 300)
}

/**
 * 切换到每日模式
 */
export function switchToDailyMode() {
  switchGameMode('daily')
}

/**
 * 切换到无尽模式
 */
export function switchToEndlessMode() {
  switchGameMode('endless')
}

/**
 * 获取当前模式的显示名称
 */
export function getCurrentModeDisplayName(): string {
  return gameMode.value === 'daily' ? '每日汉苑' : '无尽模式'
}

/**
 * 获取模式描述
 */
export function getModeDescription(mode: GameMode): string {
  switch (mode) {
    case 'daily':
      return '每天一个成语，挑战你的汉字功底'
    case 'endless':
      return '无限挑战，连续猜词不停歇'
    default:
      return ''
  }
}

/**
 * 检查是否可以切换模式
 * @param targetMode 目标模式
 */
export function canSwitchMode(targetMode: GameMode): boolean {
  // 如果正在过渡中，不允许切换
  if (modeState.value.isTransitioning) {
    return false
  }

  // 如果目标模式与当前模式相同，不需要切换
  if (gameMode.value === targetMode) {
    return false
  }

  return true
}

/**
 * 重置模式状态（用于调试或重置）
 */
/**
 * 重置无尽模式状态（仅在需要时调用）
 */
export async function resetEndlessMode() {
  const { endlessGameState, endlessTries, endlessMeta, endlessAnswer, endlessHint } = await import('~/state')
  
  // 重置无尽模式的所有状态
  endlessGameState.value = {
    currentAnswer: '',
    currentTries: [],
    isFinished: false,
    isFailed: false,
    showFailedChoice: false,
    showAnswer: false
  }
  
  // 重置无尽模式的游戏数据
  endlessTries.value = []
  endlessMeta.value = { hint: false }
  endlessAnswer.value = ''
  endlessHint.value = ''
}

/**
 * 重置模式状态（恢复到默认状态）
 */
export function resetModeState() {
  modeState.value = {
    currentMode: 'daily',
    isTransitioning: false,
    lastModeSwitch: 0
  }
  gameMode.value = 'daily'
}

/**
 * 模式切换事件监听器
 */
export function onModeChange(callback: (mode: GameMode) => void) {
  watch(gameMode, (newMode) => {
    callback(newMode)
  }, { immediate: true })
}

// 导出模式相关的响应式状态
export {
  gameMode as currentGameMode,
  gameMode as currentMode,
  modeState as currentModeState,
  switchGameMode as setGameMode
}