<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import openIcon from '../../../public/icon/icon-48.png'
import closeIcon from '../../../public/icon/close.png'
export default defineComponent({
  name: 'FloatBall',
  setup() {
    // 控制翻译状态
    const isTranslating = ref(false)

    // 控制拖拽状态
    const isDragging = ref(false)

    // 悬浮球位置
    const position = ref({ x: 0, y: 0 })

    // 拖拽起始位置
    const dragStart = ref({ x: 0, y: 0 })

    // 按钮尺寸
    const buttonSize = 50

    // 初始化位置 - 屏幕右侧中央
    const initPosition = () => {
      const x = window.innerWidth - buttonSize - 20 // 距离右边20px
      const y = window.innerHeight / 2 - buttonSize / 2 // 垂直居中
      position.value = { x, y }
    }

    // 开始拖拽
    const startDrag = (event: MouseEvent) => {
      isDragging.value = true
      dragStart.value = {
        x: event.clientX - position.value.x,
        y: event.clientY - position.value.y
      }
      event.preventDefault()
    }

    // 拖拽中
    const onDrag = (event: MouseEvent) => {
      if (!isDragging.value) return
      position.value = {
        x: event.clientX - dragStart.value.x,
        y: event.clientY - dragStart.value.y
      }
    }

    // 结束拖拽
    const stopDrag = () => {
      isDragging.value = false
    }

    // 切换翻译状态
    const toggleTranslation = () => {
      // 如果正在拖拽，则不触发翻译功能
      if (isDragging.value) return

      isTranslating.value = !isTranslating.value

      // 根据状态发送不同消息
      // 1.翻译状态
      if (isTranslating.value) {
        console.log('开始翻译')
        // 发送消息到content script开始翻译
        window.postMessage({ type: 'START_TRANSLATION' }, '*')
      } else {
        // 2.关闭翻译状态
        console.log('结束翻译')
        // 发送消息到content script停止翻译
        window.postMessage({ type: 'STOP_TRANSLATION' }, '*')
      }
    }

    // 组件挂载时初始化位置和事件监听
    onMounted(() => {
      initPosition()
      window.addEventListener('mousemove', onDrag)
      window.addEventListener('mouseup', stopDrag)
    })

    // 组件卸载前清理事件监听
    onBeforeUnmount(() => {
      window.removeEventListener('mousemove', onDrag)
      window.removeEventListener('mouseup', stopDrag)
    })

    return {
      isTranslating,
      position,
      startDrag,
      toggleTranslation,
      openIcon,
      closeIcon
    }
  },
})
</script>

<template>
  <div class="floating-container" :style="{ left: position.x + 'px', top: position.y + 'px' }" @mousedown="startDrag">
    <el-button circle :type="isTranslating ? 'danger' : 'primary'" class="float-button" @click="toggleTranslation">
      <img :src="isTranslating ? closeIcon : openIcon" :alt="isTranslating ? '关闭翻译' : '开启翻译'" class="float-button-icon" />
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.floating-container {
  position: fixed;
  z-index: 10000;
  cursor: move;
}

.float-button {
  display: flex;
  width: 50px;
  height: 50px;
  font-size: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  img {
    width: 100%;
    height: 100%;
  }

}

.float-button-icon {
  width: 70%;
  height: 70%;
  object-fit: contain;
}
</style>