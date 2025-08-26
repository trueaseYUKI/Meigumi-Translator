import { storage } from '#imports'
import { FormData } from '../types/lang'

// 获取翻译的配置
export const getInfo = async () => {
  // 1.获取到翻译的设置
  const translatedInfo = await storage.getItem('local:translateInfo')
  // 2.转换为对象
  if (!translatedInfo) return null
  else return JSON.parse(translatedInfo.toString())
}

// 保存翻译的配置
export const saveInfo = async (info: FormData) => {
  console.log('[storage]保存翻译的配置：', info)
  // 1.将info转换为字符串
  const infoString = JSON.stringify(info)
  // 2.保存到storage
  await storage.setItem('local:translateInfo', infoString)
}

// 删除翻译的配置
export const removeInfo = async () => {
  await storage.removeItem('local:translateInfo')
}
