export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  main(ctx) {
    let mountPoint: HTMLDivElement | null = null
    let vueApp: any = null
    let translationMountPoint: HTMLDivElement | null = null
    let translationApp: any = null
    let vueModule: any = null
    let buttonModule: any = null
    let contentModule: any = null

    // 动态导入Vue和组件
    Promise.all([
      import('vue'),
      import('./components/Button.vue'),
      import('./components/Content.vue'),
    ])
      .then(([vue, btnModule, contModule]) => {
        vueModule = vue
        buttonModule = btnModule
        contentModule = contModule
        console.log('模块加载完成')
      })
      .catch((error) => {
        console.error('模块加载失败:', error)
      })

    // 检查是否有文本被选中
    const isTextSelected = () => {
      const selection = window.getSelection()
      return selection && selection.toString().trim().length > 0
    }

    // 获取选中文本末尾位置
    const getSelectionEndPosition = () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return null

      const range = selection.getRangeAt(0)
      const rects = range.getClientRects()

      if (rects.length === 0) return null

      // 获取最后一个矩形（通常是选中文本的末尾）
      const lastRect = rects[rects.length - 1]

      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft

      // 返回最后一个矩形的右下角位置
      return {
        x: lastRect.right + scrollLeft,
        y: lastRect.bottom + scrollTop,
      }
    }

    // 创建并显示按钮
    const showButton = (x: number, y: number) => {
      console.log('尝试显示按钮，位置:', x, y)

      // 确保Vue和Button组件已经加载完成
      if (!vueModule || !buttonModule) {
        console.log('Vue模块尚未加载完成')
        return
      }

      // 如果按钮已经存在，则更新位置
      if (mountPoint) {
        console.log('更新按钮位置')
        mountPoint.style.left = `${x + 5}px`
        mountPoint.style.top = `${y - 20}px`
        return
      }

      // 创建挂载点
      mountPoint = document.createElement('div')
      mountPoint.id = 'deep-translator-button'
      mountPoint.style.position = 'absolute'
      mountPoint.style.left = `${x + 5}px`
      mountPoint.style.top = `${y - 20}px`
      mountPoint.style.zIndex = '10000'
      mountPoint.style.width = '40px'
      mountPoint.style.height = '40px'
      mountPoint.style.border = 'none'

      document.body.appendChild(mountPoint)
      console.log('已创建挂载点')

      // 创建Vue应用并挂载
      try {
        const { createApp } = vueModule
        const Button = buttonModule.default
        vueApp = createApp(Button)
        vueApp.mount(mountPoint)
        console.log('Vue应用已挂载')
      } catch (error) {
        console.error('Vue应用挂载失败:', error)
      }
    }

    // 显示翻译结果
    const showTranslation = (translation: string, x: number, y: number) => {
      // 隐藏按钮
      hideButton()

      // 如果翻译结果组件已经存在，则更新内容和位置
      if (translationMountPoint && translationApp) {
        translationMountPoint.style.left = `${x + 5}px`
        translationMountPoint.style.top = `${y + 5}px`
        // 更新内容（这里需要重新挂载组件以传递新属性）
        translationApp.unmount()
        if (translationMountPoint.parentNode) {
          translationMountPoint.parentNode.removeChild(translationMountPoint)
        }
      }

      // 确保Vue和Content组件已经加载完成
      if (!vueModule || !contentModule) {
        console.log('Vue或Content模块尚未加载完成')
        return
      }

      // 创建翻译结果挂载点
      translationMountPoint = document.createElement('div')
      translationMountPoint.id = 'translation-content'
      translationMountPoint.style.position = 'absolute'
      translationMountPoint.style.left = `${x + 5}px`
      translationMountPoint.style.top = `${y + 5}px`
      translationMountPoint.style.zIndex = '10000'
      translationMountPoint.style.border = 'none'

      document.body.appendChild(translationMountPoint)

      // 创建Vue应用并挂载
      try {
        const { createApp } = vueModule
        const Content = contentModule.default
        translationApp = createApp(Content, { translation })
        translationApp.mount(translationMountPoint)
        console.log('翻译结果已显示')
      } catch (error) {
        console.error('翻译结果挂载失败:', error)
      }
    }

    // 隐藏按钮
    const hideButton = () => {
      if (mountPoint && vueApp) {
        try {
          vueApp.unmount()
        } catch (error) {
          console.error('Vue应用卸载失败:', error)
        }
        if (mountPoint.parentNode) {
          mountPoint.parentNode.removeChild(mountPoint)
        }
        mountPoint = null
        vueApp = null
      }
    }

    // 隐藏翻译结果
    const hideTranslation = () => {
      if (translationMountPoint && translationApp) {
        try {
          translationApp.unmount()
        } catch (error) {
          console.error('翻译应用卸载失败:', error)
        }
        if (translationMountPoint.parentNode) {
          translationMountPoint.parentNode.removeChild(translationMountPoint)
        }
        translationMountPoint = null
        translationApp = null
      }
    }

    // 处理选择变化事件
    const handleSelectionChange = (event: MouseEvent) => {
      console.log('鼠标释放事件触发')

      if (isTextSelected()) {
        console.log('检测到选中文本')
        // 获取选中文本末尾位置
        const endPosition = getSelectionEndPosition()
        if (endPosition) {
          showButton(endPosition.x, endPosition.y)
        } else {
          // 备用方案：使用鼠标位置
          showButton(event.clientX, event.clientY)
        }
      } else {
        console.log('未检测到选中文本')
        // 延迟隐藏按钮，避免在重新选择时闪烁
        setTimeout(() => {
          if (!isTextSelected()) {
            hideButton()
          }
        }, 200)
      }
    }

    // 监听来自background的消息
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'showTranslation') {
        console.log('收到翻译结果:', message.translation)

        // 获取选中文本末尾位置
        const endPosition = getSelectionEndPosition()
        if (endPosition) {
          showTranslation(message.translation, endPosition.x, endPosition.y)
        } else {
          // 如果无法获取位置，显示在页面右上角
          showTranslation(message.translation, window.innerWidth - 300, 100)
        }

        sendResponse({ success: true })
        return true
      }
    })

    // 监听鼠标释放事件（选择完成）
    document.addEventListener('mouseup', handleSelectionChange)

    // 监听键盘事件（可能通过键盘进行选择）
    document.addEventListener('keyup', (event: KeyboardEvent) => {
      console.log('键盘事件触发')
      if (isTextSelected()) {
        console.log('键盘事件中检测到选中文本')
        // 获取选中文本末尾位置
        const endPosition = getSelectionEndPosition()
        if (endPosition) {
          showButton(endPosition.x, endPosition.y)
        }
      } else {
        setTimeout(() => {
          if (!isTextSelected()) {
            hideButton()
          }
        }, 200)
      }
    })

    // 点击页面其他地方时隐藏按钮
    document.addEventListener('click', (event) => {
      // 检查点击的元素是否在按钮外部
      if (mountPoint && !mountPoint.contains(event.target as Node)) {
        // 延迟检查是否有文本被选中
        setTimeout(() => {
          if (!isTextSelected()) {
            hideButton()
          }
        }, 10)
      }

      // 检查点击的元素是否在翻译结果外部
      if (
        translationMountPoint &&
        !translationMountPoint.contains(event.target as Node)
      ) {
        // 延迟检查是否需要隐藏翻译结果
        setTimeout(() => {
          // 这里可以根据需要决定是否隐藏翻译结果
        }, 10)
      }
    })

    console.log('Content script 初始化完成')
  },
})
