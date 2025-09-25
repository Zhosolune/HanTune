import { breakpointsTailwind } from '@vueuse/core'
import type { MatchType, ParsedChar, TriesMeta } from './logic'
import { START_DATE, TRIES_LIMIT, WORD_LENGTH, parseWord as _parseWord, testAnswer as _testAnswer, checkPass, getHint, isDstObserved, numberToHanzi } from './logic'
import { useNumberTone as _useNumberTone, inputMode, meta, spMode, tries } from './storage'
import { getAnswerOfDay } from './answers'
import { currentMode } from './logic/mode'

// 无尽模式全局状态
export const endlessAnswer = ref('')
export const endlessHint = ref('')
export const endlessTries = ref<string[]>([])
export const endlessMeta = ref<TriesMeta>({ hint: false, hintLevel: 1 })

// 无尽模式游戏进行中状态：只有尚未进入无尽模式或猜对一词后用户还没有选择是否再来一词时为false
export const endlessIsPlaying = ref(false)

export const endlessGameState = ref({
  currentAnswer: '',
  currentTries: [] as string[],
  isFinished: false,
  isFailed: false,
  showFailedChoice: false, // 显示失败后的选择（继续挑战/显示答案）
  showAnswer: false // 显示答案状态
})

export const isIOS = /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
export const isMobile = isIOS || /iPad|iPhone|iPod|Android|Phone|webOS/i.test(navigator.userAgent)
export const breakpoints = useBreakpoints(breakpointsTailwind)

export const now = useNow({ interval: 1000 })
export const isDark = useDark()
export const showHint = ref(false)
export const showSettings = ref(false)
export const showHelp = ref(false)
export const showShare = ref(false)
export const showFailed = ref(false)
export const showEndlessFailed = ref(false) // 无尽模式失败遮罩
export const showDashboard = ref(false)
export const showEndlessDashboard = ref(false)
export const showVariants = ref(false)
export const showCheatSheet = ref(false)
export const showShareDialog = ref(false)

// 分离的遮罩状态管理
export const dailyUseMask = ref(false)
export const endlessUseMask = ref(false)

// 根据当前模式返回对应的遮罩状态
export const useMask = computed({
  get: () => currentMode.value === 'daily' ? dailyUseMask.value : endlessUseMask.value,
  set: (value: boolean) => {
    if (currentMode.value === 'daily') {
      dailyUseMask.value = value
    } else {
      endlessUseMask.value = value
    }
  }
})

export const useNumberTone = computed(() => {
  if (inputMode.value === 'sp')
    return true
  if (inputMode.value === 'zy')
    return false
  return _useNumberTone.value
})

const params = new URLSearchParams(window.location.search)
export const isDev = import.meta.hot || params.get('dev') === 'hey'
export const daySince = useDebounce(computed(() => {
  // Adjust date for daylight saving time, assuming START_DATE is not in DST
  const adjustedNow = isDstObserved(now.value) ? new Date(+now.value + 3600000) : now.value
  return Math.floor((+adjustedNow - +START_DATE) / 86400000)
}))
export const dayNo = ref(+(params.get('d') || daySince.value))
export const dayNoHanzi = computed(() => `${numberToHanzi(dayNo.value)}日`)
export const answer = computed(() =>
  params.get('word')
    ? {
        word: params.get('word')!,
        hint: getHint(params.get('word')!),
      }
    : getAnswerOfDay(dayNo.value),
)

export const hint = computed(() => answer.value.hint)
export const parsedAnswer = computed(() => parseWord(answer.value.word))

// 每日模式独立状态
export const dailyIsPassed = computed(() => {
  return meta.value.passed || (tries.value.length > 0 && checkPass(testAnswer(parseWord(tries.value[tries.value.length - 1]))))
})
export const dailyIsFailed = computed(() => !dailyIsPassed.value && tries.value.length >= TRIES_LIMIT)
export const dailyIsFinished = computed(() => dailyIsPassed.value || meta.value.answer)

// 无尽模式独立状态
export const endlessIsPassed = computed(() => {
  if (endlessTries.value.length === 0) return false
  const lastTry = endlessTries.value[endlessTries.value.length - 1]
  return lastTry === endlessAnswer.value
})
export const endlessIsFailed = computed(() => {
  if (endlessTries.value.length === 0) return false
  const lastTry = endlessTries.value[endlessTries.value.length - 1]
  return endlessTries.value.length >= TRIES_LIMIT && lastTry !== endlessAnswer.value
})
export const endlessIsFinished = computed(() => endlessIsPassed.value || endlessGameState.value.showAnswer)

// 根据当前模式返回对应状态的计算属性（保持向后兼容）
export const isPassed = computed(() => {
  return currentMode.value === 'daily' ? dailyIsPassed.value : endlessIsPassed.value
})
export const isFailed = computed(() => {
  return currentMode.value === 'daily' ? dailyIsFailed.value : endlessIsFailed.value
})
export const isFinished = computed(() => {
  return currentMode.value === 'daily' ? dailyIsFinished.value : endlessIsFinished.value
})

export function parseWord(word: string, _ans = answer.value.word, mode = inputMode.value, spM = spMode.value) {
  return _parseWord(word, _ans, mode, spM)
}

export function testAnswer(word: ParsedChar[], ans = parsedAnswer.value) {
  return _testAnswer(word, ans)
}

export const parsedTries = computed(() => tries.value.map((i) => {
  const word = parseWord(i)
  const result = testAnswer(word)
  return { word, result }
}))

// 无尽模式的parsedTries计算属性
export const endlessParsedTries = computed(() => {
  if (currentMode.value !== 'endless') return []
  
  // 使用正确的数据源：endlessTries 和 endlessAnswer
  if (!endlessAnswer.value || !endlessTries.value.length) return []
  
  return endlessTries.value.map((i) => {
    const word = parseWord(i, endlessAnswer.value)
    const result = testAnswer(word, parseWord(endlessAnswer.value))
    return { word, result }
  })
})

export function getSymbolState(symbol?: string | number, key?: '_1' | '_2' | 'tone') {
  const currentParsedTries = currentMode.value === 'endless' 
    ? endlessParsedTries.value 
    : parsedTries.value
    
  const results: MatchType[] = []
  for (const t of currentParsedTries) {
    for (let i = 0; i < WORD_LENGTH; i++) {
      const w = t.word[i]
      const r = t.result[i]
      if (key) {
        if (w[key] === symbol)
          results.push(r[key])
      }
      else {
        if (w._1 === symbol)
          results.push(r._1)
        if (w._2 === symbol)
          results.push(r._2)
        if (w._3 === symbol)
          results.push(r._3)
      }
    }
  }
  if (results.includes('exact'))
    return 'exact'
  if (results.includes('misplaced'))
    return 'misplaced'
  if (results.includes('none'))
    return 'none'
  return null
}
