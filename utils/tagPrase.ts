// 1.需要解析的标签
const TARGET_TAGS = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'span',
  'label',
  'title',
  'pre',
  'blockquote',
  'article',
  'section',
]

/**
 * 检查元素是否为需要解析的目标标签
 */
export function isTargetTag(element: HTMLElement): boolean {
  return TARGET_TAGS.includes(element.tagName.toLowerCase())
}

/**
 * 检查元素是否可见（排除隐藏/不可见元素）
 */
function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetParent !== null // 排除脱离文档流且不可见的元素
  )
}

// 类型定义（可选，增强TS类型提示）
type TargetTags =
  | HTMLParagraphElement
  | HTMLHeadingElement
  | HTMLSpanElement
  | HTMLLabelElement
  | HTMLElement

/**
 * 解析页面中所有目标标签，返回标签信息和文本内容
 */
export function parseTargetTags() {
  // 用 querySelectorAll 批量获取所有目标标签
  const allElements = document.querySelectorAll<TargetTags>(
    TARGET_TAGS.join(',')
  )
  const result: Array<{
    tag: string // 标签名（如 'p'、'h1'）
    id: string | null | undefined // 元素id
    idNum: number // 自定义id
    className: string | null | undefined // 类名
    text: string // 文本内容
    element: HTMLElement // DOM元素（用于后续操作）
  }> = []

  // 去重处理（避免重复解析同一元素）
  const processedElements = new WeakSet<HTMLElement>()

  let beginId = 1
  allElements.forEach((element) => {
    // 过滤条件：目标标签 + 可见 + 未处理过 + 文本不为空
    if (
      isTargetTag(element) &&
      isElementVisible(element) &&
      !processedElements.has(element)
    ) {
      const text = element.textContent?.trim() || ''
      if (text) {
        result.push({
          tag: element.tagName.toLowerCase(),
          id: element.id,
          idNum: beginId++,
          className: element.className,
          text,
          element,
        })
        processedElements.add(element)
      }
    }
  })

  return result
}
