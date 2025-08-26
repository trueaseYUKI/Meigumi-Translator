<script>
import { defineComponent, ref, onMounted } from 'vue'

export default defineComponent({
  name: 'Content',
  props: {
    translation: {
      type: String,
      required: true
    }
  },
  setup (props) {
    const isVisible = ref(true)
    const isDragging = ref(false)
    const position = ref({ x: 0, y: 10 })
    const dragStart = ref({ x: 0, y: 0 })
    const containerRef = ref(null)
    const isFloating = ref(false)

    // 初始化位置
    onMounted(() => {
      if (containerRef.value) {
        // 初始位置设置为相对定位
        position.value = { x: 0, y: 10 }
      }
    })

    const close = () => {
      isVisible.value = false
    }

    const startDrag = (event) => {
      isDragging.value = true
      dragStart.value = {
        x: event.clientX - position.value.x,
        y: event.clientY - position.value.y
      }
      document.addEventListener('mousemove', drag)
      document.addEventListener('mouseup', stopDrag)
      event.preventDefault()
    }

    const drag = (event) => {
      if (!isDragging.value) return
      position.value = {
        x: event.clientX - dragStart.value.x,
        y: event.clientY - dragStart.value.y
      }

      // 如果开始拖拽，切换到浮动模式
      if (!isFloating.value) {
        isFloating.value = true
      }
    }

    const stopDrag = () => {
      isDragging.value = false
      document.removeEventListener('mousemove', drag)
      document.removeEventListener('mouseup', stopDrag)
    }

    return {
      isVisible,
      close,
      translation: props.translation,
      position,
      startDrag,
      isDragging,
      containerRef,
      isFloating
    }
  }
})
</script>

<template>
  <div v-if="isVisible" ref="containerRef" class="translation-container" :class="{ 'floating': isFloating }" :style="isFloating ? {
    left: position.x + 'px',
    top: position.y + 'px'
  } : {
    marginLeft: position.x + 'px',
    marginTop: position.y + 'px'
  }">
    <div class="translation-header" @mousedown="startDrag">
      <span class="translation-title">翻译结果</span>
      <button @click="close" class="close-button">×</button>
    </div>
    <div class="translation-content">
      {{ translation }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.translation-container {
  background: #f0f0f0;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 12px;
  font-family: Arial, sans-serif;
  width: calc(100% - 24px);
  box-sizing: border-box;
  position: relative;
  margin: 10px 0;
  transition: box-shadow 0.2s ease;
}

.translation-container.floating {
  position: absolute;
  width: auto;
  min-width: 400px;
  max-width: 450px;
  margin: 0;
  z-index: 10000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.translation-container:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.translation-container.floating:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .translation-container {
    background: #2d2d2d;
    border-color: #444;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .translation-container:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .translation-container.floating {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .translation-container.floating:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
  }

  .translation-header {
    border-bottom-color: #444;
  }

  .translation-title {
    color: #f0f0f0;
  }

  .close-button {
    color: #aaa;

    &:hover {
      color: #f0f0f0;
      background-color: #444;
    }
  }

  .translation-content {
    color: #e0e0e0;
  }
}

.translation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
  user-select: none;
}

.translation-title {
  font-weight: bold;
  color: #333;
  font-size: 18px;
}

.close-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    color: #333;
    background-color: #e0e0e0;
  }
}

.translation-content {
  font-size: 18px;
  color: #555;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>