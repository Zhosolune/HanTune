<script setup lang="ts">
import { isDark } from '~/state'
import { t } from '~/i18n'

const emit = defineEmits<{
  'intro-complete': []
}>()

/**
 * 进入应用主界面
 */
function enterApp() {
  emit('intro-complete')
}
</script>

<template>
  <div p="x5 y10" flex="~ col gap-4 y-center" relative max-w-150 mx-auto>
    <!-- 顶部控制按钮 -->
    <div absolute top-4 right-4>
      <button icon-btn @click="isDark = !isDark">
        <div i-carbon-sun dark:i-carbon-moon />
      </button>
    </div>

    <!-- 应用标题 -->
    <AppName h="3rem" />
    <div mt--2 op60 text-lg font-light>
      {{ t('description') }}
    </div>

    <div h-1px w-16 border="b base" my6 />

    <!-- 项目介绍 -->
    <div text-center space-y-4 max-w-120>
      <h2 text-2xl font-serif mb6>
        <b>{{ t('intro.welcome') }}</b>
      </h2>
      
      <p text-base leading-relaxed>
        {{ t('intro.description') }}
      </p>

      <div bg-gray-50 dark:bg-gray-800 rounded-lg p4 my6>
        <h3 text-lg font-medium mb3 text-primary>
          {{ t('intro.features-title') }}
        </h3>
        <div text-left space-y-2>
          <div flex="~ items-start gap-2">
            <div i-carbon-checkmark text-ok mt1 />
            <span>{{ t('intro.feature-daily') }}</span>
          </div>
          <div flex="~ items-start gap-2">
            <div i-carbon-add text-primary mt1 />
            <span><b text-primary>{{ t('intro.feature-endless') }}</b></span>
          </div>
        </div>
      </div>

      <div h-1px w-12 border="b base" my6 mx-auto />

      <!-- 致谢信息 -->
      <div text-sm op70 space-y-2>
        <p>
          <span>{{ t('intro.inspired-by') }} </span>
          <a href="https://www.powerlanguage.co.uk/wordle/" target="_blank" 
             class="text-primary hover:underline">Wordle</a>
        </p>
        
        <p>
          <span>{{ t('intro.original-project') }} </span>
          <a href="https://github.com/antfu/handle" target="_blank" 
             class="text-primary hover:underline flex items-center gap-1 justify-center">
            <div i-carbon-logo-github />
            <span>antfu/handle</span>
          </a>
        </p>
        
        <p>
          <span>{{ t('intro.created-by') }} </span>
          <a href="https://twitter.com/antfu7" target="_blank" 
             class="text-primary hover:underline">Anthony Fu</a>
          <span> & </span>
          <a href="https://twitter.com/iiiiiiines_____" target="_blank" 
             class="text-primary hover:underline">Inès</a>
        </p>
      </div>

      <div h-1px w-12 border="b base" my6 mx-auto />

      <!-- 进入按钮 -->
      <button btn p="x6 y3" text-lg @click="enterApp()">
        <span tracking-1>{{ t('intro.enter-game') }}</span>
      </button>
      
      <p text-xs op50 mt4>
        {{ t('intro.tip') }}
      </p>
    </div>
  </div>
</template>