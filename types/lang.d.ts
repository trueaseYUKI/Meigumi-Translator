export interface FormData {
  fromLanguage?: string | null
  toLanguage: string | null
  type: 'baidu' | 'llm'
  baiduApiKey?: string | null
  baiduSecretKey?: string | null
  LLMType?: string | null
  LLMApiKey?: string | null
}

export interface TranslateResult {
  // 1.原文
  srcText: string
  // 2.翻译结果
  destText?: string | null | undefined
  // 3.HTML（可以将原页面的HTML修改）
  srcHTML?: HTMLElement | string | null | undefined
  destHTML?: HTMLElement | string | null | undefined
}

// 扩展Window接口
declare global {
  interface Window {
    __TRANSLATE_TAGS__: TargetTag[] | undefined;
  }
}