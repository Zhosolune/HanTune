/**
 * 随机成语生成器
 * 负责为无尽模式提供智能的成语选择和去重功能
 */

import { answers } from '../answers/list'
import { getHint } from './utils'

// 从list.ts获取所有成语答案
const IdiomsList = answers.map(answer => answer[0]) // 只取成语，不要提示字符

/* 
// 原有从idioms.txt获取答案的逻辑（已注释）
import { IdiomsList } from './idioms'
*/

// 成语难度等级
export type IdiomDifficulty = 'easy' | 'medium' | 'hard'

// 成语选择历史记录
export interface IdiomHistory {
  idiom: string
  timestamp: number
  difficulty: IdiomDifficulty
  sessionId: string
}

// 成语统计信息
export interface IdiomStats {
  totalUsed: number
  easyUsed: number
  mediumUsed: number
  hardUsed: number
  lastUsedTime: number
  recentlyUsed: string[]
}

// 使用 localStorage 持久化成语使用历史
export const idiomHistory = useStorage<IdiomHistory[]>('hantune-idiom-history', [])
export const idiomStats = useStorage<IdiomStats>('hantune-idiom-stats', {
  totalUsed: 0,
  easyUsed: 0,
  mediumUsed: 0,
  hardUsed: 0,
  lastUsedTime: 0,
  recentlyUsed: []
})

// 常用汉字列表（用于判断成语难度）
const COMMON_CHARS = new Set([
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
  '人', '大', '小', '中', '国', '家', '天', '地', '日', '月',
  '年', '时', '分', '好', '不', '了', '在', '有', '是', '的',
  '我', '你', '他', '她', '们', '这', '那', '什', '么', '都',
  '也', '就', '还', '要', '可', '以', '会', '能', '说', '来',
  '去', '看', '听', '做', '用', '想', '知', '道', '得', '到',
  '上', '下', '前', '后', '左', '右', '里', '外', '东', '西',
  '南', '北', '高', '低', '长', '短', '多', '少', '新', '老',
  '红', '黄', '蓝', '绿', '白', '黑', '水', '火', '木', '金',
  '土', '山', '河', '海', '风', '雨', '雪', '花', '草', '树'
])

/**
 * 判断成语难度
 * @param idiom 成语
 */
function getIdiomDifficulty(idiom: string): IdiomDifficulty {
  const chars = Array.from(idiom)
  const commonCharCount = chars.filter(char => COMMON_CHARS.has(char)).length
  const commonRatio = commonCharCount / chars.length

  if (commonRatio >= 0.75) {
    return 'easy'
  } else if (commonRatio >= 0.5) {
    return 'medium'
  } else {
    return 'hard'
  }
}

/**
 * 检查成语是否在最近使用列表中
 * @param idiom 成语
 * @param recentCount 最近使用的数量限制
 */
function isRecentlyUsed(idiom: string, recentCount = 50): boolean {
  return idiomStats.value.recentlyUsed.includes(idiom)
}

/**
 * 获取指定难度的成语列表
 * @param difficulty 难度等级
 */
function getIdiomsByDifficulty(difficulty: IdiomDifficulty): string[] {
  return IdiomsList.filter(idiom => getIdiomDifficulty(idiom) === difficulty)
}

/**
 * 从列表中随机选择一个元素
 * @param list 列表
 */
function randomChoice<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

/**
 * 获取随机成语（默认导出函数）
 * @param difficulty 可选的难度等级
 * @param sessionId 可选的会话ID
 * @param excludeRecent 是否排除最近使用的成语
 * @returns 随机选择的成语和提示字符 [成语, 提示字符]
 */
export function getRandomIdiom(
  difficulty?: IdiomDifficulty,
  sessionId?: string,
  excludeRecent = true
): [string, string] {
  const idiom = generateRandomIdiom(difficulty, sessionId, excludeRecent)
  const hint = getHint(idiom)
  return [idiom, hint]
}

/**
 * 生成随机成语
 * @param difficulty 可选的难度等级
 * @param sessionId 可选的会话ID
 * @param excludeRecent 是否排除最近使用的成语
 * @returns 随机选择的成语
 */
export function generateRandomIdiom(
  difficulty?: IdiomDifficulty,
  sessionId?: string,
  excludeRecent = true
): string {
  let candidateIdioms: string[] = []

  if (difficulty) {
    // 如果指定了难度，只从该难度的成语中选择
    candidateIdioms = getIdiomsByDifficulty(difficulty)
  } else {
    // 如果没有指定难度，使用智能难度选择
    candidateIdioms = [...IdiomsList]
  }

  // 排除最近使用的成语
  if (excludeRecent) {
    candidateIdioms = candidateIdioms.filter(idiom => !isRecentlyUsed(idiom))
  }

  // 如果过滤后没有可用成语，使用全部成语
  if (candidateIdioms.length === 0) {
    candidateIdioms = difficulty ? getIdiomsByDifficulty(difficulty) : [...IdiomsList]
  }

  // 随机选择一个成语
  const selectedIdiom = randomChoice(candidateIdioms)

  // 记录使用历史
  recordIdiomUsage(selectedIdiom, sessionId)

  return selectedIdiom
}

/**
 * 智能选择成语（根据用户历史表现调整难度）
 * @param sessionId 会话ID
 * @param recentPerformance 最近表现（成功率）
 */
export function generateSmartIdiom(sessionId?: string, recentPerformance?: number): string {
  let targetDifficulty: IdiomDifficulty

  if (recentPerformance === undefined) {
    // 如果没有表现数据，随机选择难度
    const difficulties: IdiomDifficulty[] = ['easy', 'medium', 'hard']
    targetDifficulty = randomChoice(difficulties)
  } else if (recentPerformance >= 0.8) {
    // 表现很好，增加难度
    targetDifficulty = Math.random() < 0.7 ? 'hard' : 'medium'
  } else if (recentPerformance >= 0.5) {
    // 表现一般，中等难度
    targetDifficulty = Math.random() < 0.6 ? 'medium' : (Math.random() < 0.5 ? 'easy' : 'hard')
  } else {
    // 表现较差，降低难度
    targetDifficulty = Math.random() < 0.7 ? 'easy' : 'medium'
  }

  return generateRandomIdiom(targetDifficulty, sessionId)
}

/**
 * 记录成语使用历史
 * @param idiom 使用的成语
 * @param sessionId 会话ID
 */
function recordIdiomUsage(idiom: string, sessionId?: string) {
  const now = Date.now()
  const difficulty = getIdiomDifficulty(idiom)

  // 添加到历史记录
  const historyEntry: IdiomHistory = {
    idiom,
    timestamp: now,
    difficulty,
    sessionId: sessionId || 'unknown'
  }
  idiomHistory.value.push(historyEntry)

  // 更新统计信息
  const stats = idiomStats.value
  stats.totalUsed++
  stats.lastUsedTime = now

  switch (difficulty) {
    case 'easy':
      stats.easyUsed++
      break
    case 'medium':
      stats.mediumUsed++
      break
    case 'hard':
      stats.hardUsed++
      break
  }

  // 更新最近使用列表
  stats.recentlyUsed.unshift(idiom)
  if (stats.recentlyUsed.length > 100) {
    stats.recentlyUsed = stats.recentlyUsed.slice(0, 100)
  }

  // 清理过期的历史记录（保留最近1000条）
  if (idiomHistory.value.length > 1000) {
    idiomHistory.value = idiomHistory.value.slice(-1000)
  }
}

/**
 * 获取成语使用统计
 */
export function getIdiomUsageStats(): {
  total: number
  byDifficulty: Record<IdiomDifficulty, number>
  recentCount: number
  availableCount: number
} {
  const stats = idiomStats.value
  return {
    total: stats.totalUsed,
    byDifficulty: {
      easy: stats.easyUsed,
      medium: stats.mediumUsed,
      hard: stats.hardUsed
    },
    recentCount: stats.recentlyUsed.length,
    availableCount: IdiomsList.length - stats.recentlyUsed.length
  }
}

/**
 * 获取指定会话的成语使用历史
 * @param sessionId 会话ID
 */
export function getSessionIdiomHistory(sessionId: string): IdiomHistory[] {
  return idiomHistory.value.filter(entry => entry.sessionId === sessionId)
}

/**
 * 计算最近表现（成功率）
 * @param sessionId 会话ID
 * @param recentCount 最近轮次数量
 */
export function calculateRecentPerformance(sessionId: string, recentCount = 10): number {
  // 这里需要结合无尽模式的数据来计算
  // 暂时返回一个模拟值，实际实现时需要从 endless.ts 获取数据
  return Math.random() * 0.8 + 0.1 // 0.1 到 0.9 之间的随机值
}

/**
 * 重置成语使用历史（用于调试）
 */
export function resetIdiomHistory() {
  idiomHistory.value = []
  idiomStats.value = {
    totalUsed: 0,
    easyUsed: 0,
    mediumUsed: 0,
    hardUsed: 0,
    lastUsedTime: 0,
    recentlyUsed: []
  }
}

/**
 * 预热成语生成器（预先计算一些数据）
 */
export function warmupIdiomGenerator() {
  // 预先计算各难度等级的成语数量
  const easyCount = getIdiomsByDifficulty('easy').length
  const mediumCount = getIdiomsByDifficulty('medium').length
  const hardCount = getIdiomsByDifficulty('hard').length

  console.log(`成语生成器已预热：简单(${easyCount}) 中等(${mediumCount}) 困难(${hardCount})`)
}

/**
 * 获取成语详细信息
 * @param idiom 成语
 */
export function getIdiomInfo(idiom: string): {
  idiom: string
  difficulty: IdiomDifficulty
  length: number
  isRecentlyUsed: boolean
  usageCount: number
} {
  const difficulty = getIdiomDifficulty(idiom)
  const recentlyUsed = isRecentlyUsed(idiom)
  const usageCount = idiomHistory.value.filter(entry => entry.idiom === idiom).length

  return {
    idiom,
    difficulty,
    length: idiom.length,
    isRecentlyUsed: recentlyUsed,
    usageCount
  }
}