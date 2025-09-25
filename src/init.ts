import { initialized, markEnd, markStart, meta, pauseTimer, firstVisit } from './storage'
import { answer, dayNo, daySince, isDev, dailyIsFinished, dailyIsPassed, showCheatSheet, showHelp } from './state'
import { t } from './i18n'
import { answers } from './answers/list'
import { START_DATE } from './logic/constants'
import { tryFixAnswer } from './logic/answer-fix'

useTitle(computed(() => `${t('name')} - ${t('description')}`))

// 只有在非首次访问且未初始化时才显示WelcomePage
if (!initialized.value && !firstVisit.value)
  showHelp.value = true

watchEffect(() => {
  if (dailyIsPassed.value)
    meta.value.passed = true
})

watch(daySince, (n, o) => {
  // on day changed
  if (o === dayNo.value && dailyIsFinished.value)
    dayNo.value = n
})

watch([dailyIsFinished, meta], () => {
  if (dailyIsFinished.value)
    markEnd()
    // sendAnalytics()
}, { flush: 'post' })

watch(dailyIsFinished, (v) => {
  if (v)
    showCheatSheet.value = false
}, { flush: 'post' })

const visible = useDocumentVisibility()

let leaveTime = 0
const REFRESH_TIME = 1000 * 60 * 60 * 3 // 3 hours
watchEffect(() => {
  if (visible.value === 'visible') {
    // left for a long while, refresh the page for updates
    if (leaveTime && Date.now() - leaveTime > REFRESH_TIME)
      location.reload()

    // restart timer
    if (meta.value.duration)
      markStart()
  }
  else if (visible.value === 'hidden') {
    leaveTime = Date.now()
    pauseTimer()
  }
}, { flush: 'post' })

nextTick(() => {
  // if (acceptCollecting.value)
  //   sendAnalytics()

  tryFixAnswer(dayNo.value)
})

if (isDev || import.meta.hot) {
  const theDate = new Date(+START_DATE + dayNo.value * 86400000)
  // eslint-disable-next-line no-console
  console.log(`D${dayNo.value}`, theDate.toLocaleDateString(), answer.value.word, answer.value.hint)
}

if (import.meta.hot) {
  // eslint-disable-next-line no-console
  console.log(`${answers.length} days prepared`)
  // eslint-disable-next-line no-console
  console.log(`${answers.length - dayNo.value} days left`)
  // Remove the error check for development mode to support endless mode
  // if ((answers.length - daySince.value) < 10)
  //   throw new Error('Not enough days left!')
}
