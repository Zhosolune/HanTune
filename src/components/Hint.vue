<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { answer, dayNoHanzi, hint, endlessAnswer, endlessHint, endlessMeta } from '~/state'
import { meta } from '~/storage'
import { t } from '~/i18n'
import { currentMode } from '~/logic/mode'
import { parseChar } from '~/logic'

// 使用全局状态，不再需要 inject
console.log('Hint.vue - endlessAnswer:', endlessAnswer)
console.log('Hint.vue - endlessHint:', endlessHint)
console.log('Hint.vue - endlessAnswer?.value:', endlessAnswer?.value)
console.log('Hint.vue - endlessHint?.value:', endlessHint?.value)

watchEffect(() => {
  console.log('Hint.vue watchEffect - endlessAnswer.value:', endlessAnswer.value)
  console.log('Hint.vue watchEffect - endlessHint.value:', endlessHint.value)
  console.log('Hint.vue watchEffect - endlessMeta.value:', endlessMeta.value)
})

// 根据模式选择正确的答案和提示
const currentAnswer = computed(() => 
  currentMode.value === 'endless' ? endlessAnswer.value : answer.value.word
)

const currentHint = computed(() => 
  currentMode.value === 'endless' 
    ? endlessHint.value
    : hint.value
)

const currentMeta = computed(() => 
  currentMode.value === 'endless' ? endlessMeta.value : meta.value
)

const parsed = computed(() => {
  console.log('Hint parsed - currentHint:', currentHint.value, 'currentAnswer:', currentAnswer.value)
  
  if (!currentHint.value || !currentAnswer.value) {
    console.log('Hint parsed - returning empty object due to missing data')
    return { char: '', _1: '', _2: '', _3: '', parts: [], yin: '', tone: 0 }
  }
  
  // getHint 返回单个字符，所以使用 parseChar 而不是 parseWord
  const result = parseChar(currentHint.value)
  console.log('Hint parsed - parseChar result:', result)
  
  return result
})
const masked = computed(() => ({
  ...parsed.value,
  char: '?',
}))

const displayTitle = computed(() => 
  currentMode.value === 'endless' ? '无尽模式' : dayNoHanzi.value
)

function updateHintLevel() {
  if (currentMode.value === 'endless') {
    endlessMeta.value.hintLevel = 2
  } else {
    meta.value.hintLevel = 2
  }
}
</script>

<template>
  <div p8 flex="~ col gap-4" items-center>
    <p><b>{{ displayTitle }}</b></p>
    <div>{{ t('hint-note') }} <b>{{ currentMeta.hintLevel === 2 ? t('hanzi') : t('ziyin') }}</b></div>
    <CharBlock :char="currentMeta.hintLevel === 2 ? parsed : masked" />
    <button
      v-if="currentMeta.hintLevel !== 2"
      class="btn bg-mis"
      @click="updateHintLevel"
    >
      {{ t('more-hint') }}
    </button>
  </div>
</template>
