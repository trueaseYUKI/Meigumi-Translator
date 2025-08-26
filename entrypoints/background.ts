import { translate } from '../utils/translator'

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id })

  // 监听来自content script的消息
  browser.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.action === 'openPopup') {
        // 打开popup窗口
        browser.action.openPopup()
        sendResponse({ success: true })
      } else if (message.action === 'translateText') {
        // 处理文本翻译请求
        console.log('需要翻译的文本:', message.text)
        translate(message.text)
          .then((translation) => {
            // 将翻译结果发送回content script
            if (sender.tab && sender.tab.id) {
              browser.tabs
                .sendMessage(sender.tab.id, {
                  action: 'showTranslation',
                  translation: translation?.destText,
                })
                .then(() => {
                  sendResponse({ success: true, translation })
                })
                .catch((error) => {
                  console.error('发送翻译结果失败:', error)
                  sendResponse({ success: false, error: error.message })
                })
            }
          })
          .catch((error) => {
            console.error('翻译失败:', error)
            sendResponse({ success: false, error: error.message })
          })

        // 异步响应
        return true
      }
    }
  )

  // 模拟翻译函数
  async function translateText(text: string): Promise<string> {
    // 这里应该实现真实的翻译逻辑
    // 比如调用百度翻译API、谷歌翻译API或其他翻译服务

    // 模拟翻译延迟
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 模拟翻译结果
    return `[翻译结果] ${text}`
  }
})
