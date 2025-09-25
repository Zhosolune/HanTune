import hans from './locales/zh-cn.json'
import hant from './locales/zh-tw.json'

const lang = window.navigator.language?.toLowerCase() || ''
export const preferTraditional = lang.includes('hant') || lang.includes('tw') || lang.includes('hk')
export const preferZhuyin = lang.includes('tw')

export const locale = useStorage<'hans' | 'hant'>('handle-locale', preferTraditional ? 'hant' : 'hans')

// 递归获取嵌套对象的值
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}

export function t(key: string, ...args: any[]): string {
  const hansValue = getNestedValue(hans, key)
  const hantValue = locale.value === 'hant' ? getNestedValue(hant, key) : null
  const str: string = hantValue || hansValue
  return str.replace(/\{(\d+)\}/g, (_, i) => args[i])
}
