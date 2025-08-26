import { FormData, TranslateResult } from '../types/lang'
import { getInfo } from './storage'
import { lang } from '../assets/languages'
import md5 from 'md5'
import { baseUrls } from '../assets/config'
import HttpClient, { RequestOptions } from './httpClient'


const http = new HttpClient()
export const translate = async (
  content: string
): Promise<TranslateResult | void | null> => {
  // 2.获取翻译设置
  const info: FormData = await getInfo()
  // 1.判断传递过来的类型
  if (!info || !info.type || !info.toLanguage) {
    return
  }

  // 3.根据翻译类型来执行不同的逻辑
  let res: TranslateResult | void | null = null
  if (info.type === 'baidu') {
    return translateByBaidu(info, content)
  } else if (info.type === 'llm') {
    switch (info.LLMType) {
      case 'ds':
        res = await translateByDeepSeek(info, content)
        break
      case 'qw':
        break
      case 'gpt':
        break
      case 'wxyy':
        break
      case 'grok':
        break
      case 'kimi':
        break
      case 'xh':
        break
      case 'Gemini':
        break
      default:
        res = await translateByDeepSeek(info, content)
    }
  }
  return res
}

// 1.百度翻译
const translateByBaidu = async (data: FormData, content: string) => {
  // 随机生成5位随机数
  const salt = Math.floor(Math.random() * 90000) + 10000
  const sign = md5(
    `${data.baiduApiKey}${content}${salt.toString()}${data.baiduSecretKey}`
  )
  const reqParams = {
    q: content,
    from: data.fromLanguage || 'auto',
    to: data.toLanguage,
    appid: data.baiduApiKey,
    salt,
    sign,
  }

  console.log('[百度翻译] 请求参数:', reqParams)

  const res = await http.post(baseUrls.baidu, reqParams, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // 覆盖默认Content-Type
    },
  })

  res['type'] = 'baidu'
  res['srcText'] = content

  console.log('百度翻译返回值：', res)
  return parseBaidu(res)
}
const parseBaidu = (res: any): TranslateResult | void => {
  if (!res) return
  return {
    srcText: res.srcText,
    destText: res.trans_result[0].dst,
  }
}

// 2.deepseek翻译
const translateByDeepSeek = async (
  data: FormData,
  text: string
): Promise<TranslateResult | void | null> => {
  // 1.如果没有密钥，则返回
  if (!data.LLMApiKey || data.LLMApiKey.trim() === '') return

  // 2.添加断言保证data.from的值是对lang对象有效的值
  const from = data.fromLanguage
    ? lang[data.fromLanguage as keyof typeof lang]
    : '自动检测语种'
  const to = data.fromLanguage
    ? lang[data.toLanguage as keyof typeof lang]
    : '中文'
  // 3.建立请求对象
  const reqParams = {
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `你是一个专业的语言工作者，翻译语言信雅达，请你只返回翻译结果，请勿返回其他内容`,
      },
      {
        role: 'user',
        content: `现在要求你将"${text}"从${from}翻译成${to}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4096,
    stream: false,
  }

  // 4.发送请求
  const res = await http.post(baseUrls.ds, reqParams, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.LLMApiKey}`,
    },
  })

  console.log('[deepseek] 响应结果:', res)

  res['srcText'] = text
  return parseDeepSeek(res)
}

const parseDeepSeek = (res: any): TranslateResult | void => {
  if (!res) return
  return {
    srcText: res.srcText,
    destText: res.choices[0].message.content,
  }
}
