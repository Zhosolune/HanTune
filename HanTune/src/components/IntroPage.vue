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

/**
 * 关闭介绍页面
 */
function closeIntro() {
  emit('intro-complete')
}
</script>

<template>
  <div p="x5 y10" flex="~ col gap-2 y-center" relative mx-auto>
    <div absolute top-4 right-4 flex="~ gap-3">
      <button icon-btn @click="closeIntro()">
        <div i-carbon-close />
      </button>
    </div>

    <!-- 应用标题 -->
    <AppName h="2.5rem" />
      <div mt--1 op50 text-sm>
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
          <div text-left space-y-2 max-w-80 mx-auto>
            <div>
              <span v-html="t('intro.feature-daily')"></span>
            </div>
            <div>
              <span v-html="t('intro.feature-endless')"></span>
            </div>
          </div>
        </div>

        <div h-1px w-12 border="b base" my6 mx-auto />

        <!-- 致谢信息 -->
        <div text-sm op70 space-y-2>

          <p>
            <span>{{ t('intro.original-project') }} </span>
            <a href="https://github.com/antfu/handle" target="_blank"
              class="text-primary hover:underline inline-flex items-center gap-1">
              <div i-carbon-logo-github />
              <span>antfu/handle</span>
            </a>
          </p>

          <p>
            <span>{{ t('intro.created-by') }} </span>
            <a href="https://twitter.com/antfu7" target="_blank" class="text-primary hover:underline">Anthony Fu</a>
            <span> & </span>
            <a href="https://twitter.com/iiiiiiines_____" target="_blank" class="text-primary hover:underline">Inès</a>
          </p>
        </div>

        <div h-1px w-12 border="b base" my6 mx-auto />

        <!-- 进入按钮 -->
        <button btn p="x4 y2" @click="enterApp()">
          <span tracking-1 pl1>{{ t('intro.enter-game') }}</span>
        </button>

        <p text-xs op50 mt4 text-center>
          {{ t('intro.tip') }}
        </p>
      </div>
    </div>
</template>