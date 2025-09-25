<script setup lang="ts">
import { toPng } from 'html-to-image'
import { saveAs } from 'file-saver'
import { dayNoHanzi, isIOS, isMobile, useMask, endlessTries, endlessAnswer } from '~/state'
import { tries } from '~/storage'
import { isEndlessMode } from '~/logic/mode'
import { currentRound } from '~/logic/endless'
import { t } from '~/i18n'
import EndlessResultFooter from './EndlessResultFooter.vue'

const el = ref<HTMLDivElement>()
const show = ref(false)
const showDialog = ref(false)
const dataUrlUnmasked = ref('')
const dataUrlMasked = ref('')

const dataUrl = computed(() => useMask.value ? dataUrlMasked.value : dataUrlUnmasked.value)

// 根据模式生成文件名
const fileName = computed(() => {
  const baseName = t('name')
  if (isEndlessMode.value) {
    const roundNum = currentRound.value?.roundNumber || 1
    return `${baseName} 第${roundNum}轮${useMask.value ? ' 遮罩' : ''}.png`
  } else {
    return `${baseName} ${dayNoHanzi.value}${useMask.value ? ' 遮罩' : ''}.png`
  }
})

// 根据模式获取当前尝试记录
const currentTries = computed(() => {
  return isEndlessMode.value ? endlessTries.value : tries.value
})

// 根据模式获取当前答案
const currentAnswer = computed(() => {
  return isEndlessMode.value ? endlessAnswer.value : undefined
})

async function render() {
  show.value = true
  await nextTick()
  await nextTick()
  showDialog.value = true
  const p = useMask.value
  useMask.value = false
  await nextTick()
  dataUrlUnmasked.value = await toPng(el.value!)
  useMask.value = true
  await nextTick()
  dataUrlMasked.value = await toPng(el.value!)
  useMask.value = p
  show.value = false
}

onMounted(() => render())

async function download() {
  saveAs(dataUrl.value, fileName.value)
}
</script>

<template>
  <div v-if="isMobile" op50 mb4>
    {{ t('press-and-download-image') }}
  </div>
  <img v-if="dataUrl" :src="dataUrl" w-80 min-h-10 border="~ base rounded">
  <div v-else w-80 border="~ base rounded" p4 animate-pulse>
    {{ t('rendering') }}
  </div>

  <div flex="~" py4>
    <button v-if="!isIOS" mx2 square-btn flex-gap-1 :disabled="!dataUrl" @click="download()">
      <div i-carbon-download />
      {{ t('download') }}
    </button>

    <ToggleMask mx2 />
  </div>

  <div v-if="show" fixed op0 top-0 left-0 pointer-events-none>
    <div ref="el" flex="~ col" items-center p="x6 y4" bg-base relative text-center>
      <AppName w-full />
      <div w-full text-xs mt1 mb3 op50 ws-nowrap>
        占位
      </div>

      <WordBlocks v-for="w, i of currentTries" :key="i" :word="w" :revealed="true" :animate="false" :answer="currentAnswer" />
      
      <!-- 根据模式显示不同的结果页脚 -->
      <template v-if="isEndlessMode">
        <EndlessResultFooter mt3 w-full />
      </template>
      <template v-else>
        <ResultFooter :day="true" mt3 w-full />
      </template>
    </div>
  </div>
</template>
