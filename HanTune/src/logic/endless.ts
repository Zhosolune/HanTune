/**
 * 无尽模式引擎
 * 负责管理无尽模式的轮次、状态和游戏流程
 */

// 无尽模式轮次状态接口
export interface EndlessRound {
  roundId: string
  roundNumber: number
  idiom: string
  answer: string
  attempts: string[]
  startTime: number
  endTime?: number
  tries: string[]
  passed: boolean
  failed: boolean
  hint: boolean
  hintLevel?: number
  duration?: number
  attemptCount?: number
}

// 无尽模式会话状态接口
export interface EndlessSession {
  sessionId: string
  startTime: number
  endTime?: number
  totalRounds: number
  passedRounds: number
  failedRounds: number
  currentRound?: EndlessRound
  rounds: EndlessRound[]
  isActive: boolean
  bestStreak: number
  currentStreak: number
}

// 无尽模式统计接口
export interface EndlessStats {
  totalSessions: number
  totalRounds: number
  totalPassed: number
  totalFailed: number
  bestStreak: number
  averageRoundsPerSession: number
  totalPlayTime: number
  averageRoundTime: number
  totalAttempts: number
  totalHintUsed: number
}

// 使用 localStorage 持久化无尽模式数据
export const currentEndlessSession = useStorage<EndlessSession | null>('hantune-endless-session', null)
export const endlessHistory = useStorage<EndlessSession[]>('hantune-endless-history', [])
export const endlessStats = useStorage<EndlessStats>('hantune-endless-stats', {
  totalSessions: 0,
  totalRounds: 0,
  totalPassed: 0,
  totalFailed: 0,
  bestStreak: 0,
  averageRoundsPerSession: 0,
  totalPlayTime: 0,
  averageRoundTime: 0,
  totalAttempts: 0,
  totalHintUsed: 0
})

// 响应式计算属性
export const isEndlessSessionActive = computed(() => 
  currentEndlessSession.value?.isActive ?? false
)

export const currentRound = computed(() => 
  currentEndlessSession.value?.currentRound
)

export const currentRoundNumber = computed(() => 
  currentEndlessSession.value?.currentRound?.roundNumber ?? 0
)

export const currentStreak = computed(() => 
  currentEndlessSession.value?.currentStreak ?? 0
)

/**
 * 生成唯一ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 开始新的无尽模式会话
 */
export function startEndlessSession(): EndlessSession {
  // 如果有活跃会话，先结束它
  if (currentEndlessSession.value?.isActive) {
    endEndlessSession()
  }

  const sessionId = generateId()
  const session: EndlessSession = {
    sessionId,
    startTime: Date.now(),
    totalRounds: 0,
    passedRounds: 0,
    failedRounds: 0,
    rounds: [],
    isActive: true,
    bestStreak: 0,
    currentStreak: 0
  }

  currentEndlessSession.value = session
  return session
}

/**
 * 开始新轮次
 * @param idiom 成语
 */
export function startNewRound(idiom: string): EndlessRound {
  if (!currentEndlessSession.value?.isActive) {
    throw new Error('No active endless session')
  }

  const session = currentEndlessSession.value
  const roundId = generateId()
  const roundNumber = session.totalRounds + 1

  const round: EndlessRound = {
    roundId,
    roundNumber,
    idiom,
    answer: idiom,
    attempts: [],
    startTime: Date.now(),
    tries: [],
    passed: false,
    failed: false,
    hint: false
  }

  session.currentRound = round
  // 注释掉：不在开始轮次时增加总计数，而是在完成轮次时增加
  // session.totalRounds++

  return round
}

/**
 * 添加尝试
 * @param attempt 尝试的词语
 */
export function addAttempt(attempt: string) {
  const round = currentRound.value
  if (!round || round.passed || round.failed) {
    return
  }

  round.tries.push(attempt)
}

/**
 * 完成当前轮次
 * @param passed 是否通过
 * @param usedHint 是否使用了提示
 * @param hintLevel 提示等级
 */
export function completeRound(passed: boolean, usedHint = false, hintLevel = 0) {
  const session = currentEndlessSession.value
  const round = currentRound.value

  if (!session?.isActive || !round) {
    return
  }

  // 更新轮次状态
  round.endTime = Date.now()
  round.duration = round.endTime - round.startTime
  round.passed = passed
  round.failed = !passed
  round.hint = usedHint
  round.hintLevel = hintLevel
  round.attemptCount = round.tries.length

  // 更新会话统计
  session.totalRounds++ // 在完成轮次时增加总计数
  if (passed) {
    session.passedRounds++
    session.currentStreak++
    if (session.currentStreak > session.bestStreak) {
      session.bestStreak = session.currentStreak
    }
  } else {
    session.failedRounds++
    session.currentStreak = 0
  }

  // 更新全局统计
  const stats = endlessStats.value
  stats.totalRounds++
  stats.totalAttempts += round.attemptCount
  if (passed) {
    stats.totalPassed++
  } else {
    stats.totalFailed++
  }
  if (usedHint) {
    stats.totalHintUsed++
  }

  // 更新平均轮次时间
  if (round.duration) {
    const currentTotalTime = stats.averageRoundTime * (stats.totalRounds - 1)
    stats.averageRoundTime = (currentTotalTime + round.duration) / stats.totalRounds
  }

  // 将轮次添加到历史记录
  session.rounds.push({ ...round })

  // 注意：不立即清除 currentRound，保留用于结果显示
  // session.currentRound = undefined
}

/**
 * 结束无尽模式会话
 */
export function endEndlessSession() {
  const session = currentEndlessSession.value
  if (!session?.isActive) {
    return
  }

  // 如果有未完成的轮次，标记为失败
  if (session.currentRound) {
    completeRound(false)
  }

  // 更新会话状态
  session.isActive = false
  session.endTime = Date.now()

  // 更新全局统计
  updateEndlessStatsInternal(session)

  // 添加到历史记录
  endlessHistory.value.push({ ...session })

  // 清除当前会话
  currentEndlessSession.value = null
}

/**
 * 更新无尽模式统计（公共接口）
 * @param passed 是否通过
 * @param attempts 尝试次数
 */
export function updateEndlessStats(passed: boolean, attempts: number) {
  const session = currentEndlessSession.value
  if (!session) {
    return
  }

  // 更新会话统计
  if (passed) {
    session.passedRounds++
    session.currentStreak++
    if (session.currentStreak > session.bestStreak) {
      session.bestStreak = session.currentStreak
    }
  } else {
    session.failedRounds++
    session.currentStreak = 0
  }

  session.totalRounds++
}

/**
 * 获取无尽模式统计
 */
export function getEndlessStats(): {
  totalCorrect: number
  totalRounds: number
  currentStreak: number
  bestStreak: number
} {
  const session = currentEndlessSession.value
  const stats = endlessStats.value

  return {
    totalCorrect: session?.passedRounds ?? 0,
    totalRounds: session?.totalRounds ?? 0,
    currentStreak: session?.currentStreak ?? 0,
    bestStreak: session?.bestStreak ?? stats.bestStreak
  }
}

/**
 * 获取无尽模式详细统计数据（用于计分板）
 */
export function getEndlessDetailedStats(): {
  totalRounds: number
  totalPassed: number
  totalFailed: number
  successRate: number
  averageAttempts: number
  averageDuration: string
  bestStreak: number
  currentStreak: number
  totalPlayTime: number
} {
  const stats = endlessStats.value
  const session = currentEndlessSession.value

  // 计算成功率
  const successRate = stats.totalRounds > 0 
    ? Math.round((stats.totalPassed / stats.totalRounds) * 100)
    : 0

  // 计算平均尝试次数
  const averageAttempts = stats.totalRounds > 0 && stats.totalAttempts > 0
    ? stats.totalAttempts / stats.totalRounds
    : 0

  // 格式化平均用时
  const averageDuration = stats.averageRoundTime > 0 
    ? formatDuration(stats.averageRoundTime)
    : '-'

  return {
    totalRounds: stats.totalRounds,
    totalPassed: stats.totalPassed,
    totalFailed: stats.totalFailed,
    successRate,
    averageAttempts: Number(averageAttempts.toFixed(1)),
    averageDuration,
    bestStreak: stats.bestStreak,
    currentStreak: session?.currentStreak ?? 0,
    totalPlayTime: stats.totalPlayTime
  }
}

/**
 * 进入下一轮
 */
export function nextRound() {
  const session = currentEndlessSession.value
  if (!session?.isActive) {
    startEndlessSession()
    return
  }

  // 清理当前轮次
  if (session.currentRound) {
    session.rounds.push(session.currentRound)
    session.currentRound = undefined
  }
}

/**
 * 重置无尽模式会话
 */
export function resetEndlessSession() {
  currentEndlessSession.value = null
}

/**
 * 更新无尽模式统计（内部函数）
 * @param session 完成的会话
 */
function updateEndlessStatsInternal(session: EndlessSession) {
  const stats = endlessStats.value

  stats.totalSessions++
  stats.totalRounds += session.totalRounds
  stats.totalPassed += session.passedRounds
  stats.totalFailed += session.failedRounds

  if (session.bestStreak > stats.bestStreak) {
    stats.bestStreak = session.bestStreak
  }

  // 计算平均值
  stats.averageRoundsPerSession = stats.totalRounds / stats.totalSessions

  // 计算总游戏时间
  if (session.endTime && session.startTime) {
    stats.totalPlayTime += session.endTime - session.startTime
  }

  // 计算平均轮次时间
  const totalRoundTime = session.rounds.reduce((sum, round) => 
    sum + (round.duration || 0), 0
  )
  const currentAverageTime = stats.averageRoundTime * (stats.totalRounds - session.totalRounds)
  stats.averageRoundTime = (currentAverageTime + totalRoundTime) / stats.totalRounds
}

/**
 * 获取当前轮次的尝试次数
 */
export function getCurrentRoundAttempts(): number {
  return currentRound.value?.tries.length ?? 0
}

/**
 * 检查是否可以开始新轮次
 */
export function canStartNewRound(): boolean {
  const session = currentEndlessSession.value
  if (!session?.isActive) {
    return false
  }

  // 如果有当前轮次且未完成，不能开始新轮次
  if (session.currentRound && !session.currentRound.passed && !session.currentRound.failed) {
    return false
  }

  return true
}

/**
 * 获取会话摘要
 */
export function getSessionSummary(): {
  totalRounds: number
  passedRounds: number
  failedRounds: number
  currentStreak: number
  bestStreak: number
  duration: number
} | null {
  const session = currentEndlessSession.value
  if (!session) {
    return null
  }

  const duration = session.endTime 
    ? session.endTime - session.startTime
    : Date.now() - session.startTime

  return {
    totalRounds: session.totalRounds,
    passedRounds: session.passedRounds,
    failedRounds: session.failedRounds,
    currentStreak: session.currentStreak,
    bestStreak: session.bestStreak,
    duration
  }
}

/**
 * 重置无尽模式数据（用于调试）
 */
export function resetEndlessData() {
  currentEndlessSession.value = null
  endlessHistory.value = []
  endlessStats.value = {
    totalSessions: 0,
    totalRounds: 0,
    totalPassed: 0,
    totalFailed: 0,
    bestStreak: 0,
    averageRoundsPerSession: 0,
    totalPlayTime: 0,
    averageRoundTime: 0,
    totalAttempts: 0,
    totalHintUsed: 0
  }
}

/**
 * 格式化时长显示
 * @param duration 时长（毫秒）
 */
export function formatDuration(duration: number): string {
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  } else if (minutes > 0) {
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  } else {
    return `${seconds}秒`
  }
}