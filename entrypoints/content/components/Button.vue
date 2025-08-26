<script>
import { defineComponent, ref } from 'vue'
// 导入wxt的消息通信机制

export default defineComponent({
  name: 'Button',
  setup () {
    const isPressed = ref(false)

    console.log('Button组件初始化')

    // 获取当前选中的文本
    const getSelectedText = () => {
      const selection = window.getSelection()
      return selection ? selection.toString().trim() : ''
    }

    const handleClick = () => {
      console.log('按钮被点击')
      const selectedText = getSelectedText()
      if (selectedText) {
        console.log('选中的文本:', selectedText)
        // 向background发送消息，包含选中的文本
        // 检查扩展上下文是否仍然有效
        if (chrome.runtime?.id) {
          chrome.runtime.sendMessage({
            action: 'translateText',
            text: selectedText
          }).then(response => {
            console.log('翻译完成:', response)
          }).catch(error => {
            console.error('翻译请求失败:', error)
          })
        } else {
          console.warn('扩展上下文已失效，无法发送消息')
        }
      } else {
        console.log('没有选中文本')
      }
    }

    const handleMouseDown = () => {
      isPressed.value = true
    }

    const handleMouseUp = () => {
      isPressed.value = false
    }

    const handleMouseLeave = () => {
      isPressed.value = false
    }

    return {
      handleClick,
      handleMouseDown,
      handleMouseUp,
      handleMouseLeave,
      isPressed
    }
  }
})
</script>

<template>
  <div class="btn-container">
    <el-button type="primary" @click="handleClick" @mousedown="handleMouseDown" @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave" circle :class="{ pressed: isPressed }">
      <img src="../../../assets/icons/icon32.png" alt="Translate">
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.btn-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  padding: 2px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;

  :deep(.el-button) {
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    background: #409eff;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;

    &.pressed {
      transform: scale(0.92);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  :deep(.el-button:hover img) {
    transform: scale(1.1);
  }
}
</style>