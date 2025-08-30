// entrypoints/example-ui.content/index.ts
import { createApp } from 'vue'
import FloatBall from './components/FloatBall.vue'
import { parseTargetTags, isTargetTag } from '../../utils/tagPrase'

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  main(ctx) {
    // 1. 初始化悬浮球UI
    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        const floatBall = createApp(FloatBall)
        floatBall.mount(container)
        return floatBall
      },
      onRemove: (app: any) => {
        app.unmount()
      },
    })
    ui.mount()

    // 存储翻译结果的Map
    const translationMap = new Map<HTMLElement, HTMLElement>()

    // 监听来自FloatBall的消息
    window.addEventListener('message', async (event) => {
      if (event.source !== window) return
      if (event.data.type === 'START_TRANSLATION') {
        await startTranslation()
      } else if (event.data.type === 'STOP_TRANSLATION') {
        stopTranslation()
      }
    })

    // 开始翻译功能
    const startTranslation = async () => {
      console.log('开始沉浸式翻译')
      
      // 解析页面中的目标标签
      const parsedTags = parseTargetTags()
      console.log('解析到的目标标签:', parsedTags)
      
      // 提取需要翻译的文本
      const textsToTranslate = parsedTags.map(tag => tag.text)
      console.log('需要翻译的文本:', textsToTranslate)
      
      // 分批翻译文本（避免API限制）
      for (let i = 0; i < textsToTranslate.length; i++) {
        const text = textsToTranslate[i]
        const tagInfo = parsedTags[i]
        
        try {
          // 发送翻译请求到background script
          const response = await browser.runtime.sendMessage({
            action: 'translateText',
            text: text
          })
          
          if (response.success) {
            // 创建翻译结果元素
            const translationElement = document.createElement('div')
            translationElement.className = 'translation-result'
            translationElement.style.cssText = `
              margin: 5px 0;
              padding: 10px;
              background-color: #f0f8ff;
              border-left: 3px solid #4285F4;
              font-size: 14px;
              line-height: 1.5;
            `
            translationElement.textContent = response.translation
            
            // 将翻译结果插入到原文下方
            tagInfo.element.parentNode?.insertBefore(translationElement, tagInfo.element.nextSibling)
            
            // 记录翻译结果元素，方便后续清理
            translationMap.set(tagInfo.element, translationElement)
          }
        } catch (error) {
          console.error('翻译出错:', error)
        }
      }
    }

    // 停止翻译功能（清理翻译结果）
    const stopTranslation = () => {
      console.log('停止沉浸式翻译')
      
      // 移除所有翻译结果
      translationMap.forEach((translationElement) => {
        translationElement.remove()
      })
      
      // 清空Map
      translationMap.clear()
    }

    // 2. 页面加载完成后解析标签
    const handleDomLoaded = () => {
      if (ctx.isInvalid) return // 上下文失效则停止

      const parsedTags = parseTargetTags()
      console.log('解析到的目标标签:', parsedTags)

      // 这里可以将解析结果传递给悬浮球组件（如通过事件总线或全局变量）
      // 示例：存储到window对象供组件访问
      window.__TRANSLATE_TAGS__ = parsedTags
    }

    // 3. 监听DOM加载完成事件
    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      // 页面已加载完成，直接执行
      handleDomLoaded()
    } else {
      // 页面未加载完成，等待DOMContentLoaded事件
      ctx.addEventListener(document, 'DOMContentLoaded', handleDomLoaded)
    }

    // 4. 监听动态内容（如SPA路由切换、异步加载的标签）
    const observer = new MutationObserver((mutations) => {
      if (ctx.isInvalid) {
        observer.disconnect()
        return
      }

      // 检查是否有新的目标标签被添加
      const hasNewTargetTags = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some(
          (node) => node instanceof HTMLElement && isTargetTag(node)
        )
      )

      if (hasNewTargetTags) {
        handleDomLoaded() // 有新标签添加时重新解析
      }
    })

    // 监听整个文档的DOM变化（子节点增减 + 子树变化）
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false, // 不需要监听属性变化
      characterData: false,
    })

    // 5. 上下文失效时清理监听
    ctx.onInvalidated(() => {
      observer.disconnect()
      stopTranslation()
    })
  },
})