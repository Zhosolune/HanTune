<script setup lang="ts">
import { t } from '~/i18n'
import { answer, dayNoHanzi, isMobile, parseWord, testAnswer, endlessAnswer, endlessTries, endlessMeta } from '~/state'
import { meta, tries } from '~/storage'
import { isEndlessMode } from '~/logic/mode'
import { currentRound } from '~/logic/endless'

const lines = computed(() => {
  // 根据当前模式选择数据源
  const currentTries = isEndlessMode.value ? endlessTries.value : tries.value
  const currentAnswer = isEndlessMode.value ? endlessAnswer.value : answer.value.word
  const currentMeta = isEndlessMode.value ? endlessMeta.value : meta.value
  
  const table = currentTries.map((word) => {
    const parsed = parseWord(word, currentAnswer)
    const answerParsed = parseWord(currentAnswer)
    return testAnswer(parsed, answerParsed)
      .map((i, idx) => {
        if (i.char === 'exact')
          return '🟩'
        if (i.char === 'misplaced')
          return '🟧'
        if (parsed[idx]._1 && i._1 === 'exact')
          return '🟠'
        if (parsed[idx]._2 && i._2 === 'exact')
          return '🟠'
        if (parsed[idx]._3 && i._3 === 'exact')
          return '🟠'
        if (i._1 === 'misplaced' || i._2 === 'misplaced' || i._3 === 'misplaced')
          return '🟡'
        return '⬜️'
      })
      .join('')
  })

  // 根据模式生成标题行
  const titleParts = [t('name')]
  
  if (isEndlessMode.value) {
    // 无尽模式只显示轮次信息，不显示日期
    titleParts.push(`第 ${currentRound.value?.roundNumber || 1} 轮`)
  } else {
    // 每日模式显示日期
    titleParts.push(dayNoHanzi.value)
  }
  
  // 添加模式信息
  if (currentMeta.strict) {
    titleParts.push(t('strict-mode').slice(0, 2))
  }
  if (!currentMeta.hint) {
    titleParts.push(t('hint-level-none'))
  }

  return [
    titleParts.filter(Boolean).join(' · '),
    '',
    ...table,
    '',
    '占位',
  ]
})

const text = computed(() => lines.value.join('\n'))

const share = useShare(computed(() => ({
  title: t('name'),
  text: text.value,
})))
const clipboard = useClipboard()
const copied = ref(false)

async function shareSystem() {
  if (share.isSupported && isMobile) {
    await share.share()
    return true
  }
  return false
}

onMounted(async () => {
  if (clipboard.isSupported) {
    await clipboard.copy(text.value)
    copied.value = true
  }
})
</script>

<template>
  <p text-center mb4>
    {{ copied ? t('share-copied') : t('share-not-copied') }}
  </p>
  <textarea
    bg-gray-500:5 rounded p5 select-text resize-none outline-none
    w-90 text-center
    style="line-height: 19px;letter-spacing: 1px;"
    :rows="lines.length"
    :value="text" readonly
  />
  <button v-if="share.isSupported" my4 square-btn @click="shareSystem()">
    <div i-carbon-share />
    {{ t('share-with-system-api') }}
  </button>
</template>
