<template>
  <iframe
    v-if="pdfUrl"
    :src="pdfUrl"
    class="pdf-frame"
    frameborder="0"
  />
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  blob: {
    type: Blob,
    required: true
  }
})

const pdfUrl = ref('')
let objectUrl = ''

watch(
  () => props.blob,
  (blob) => {
    if (!blob) return

    // 1️⃣ 清理旧 objectURL
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = ''
    }

    // 2️⃣ 修正 MIME，确保浏览器识别为 PDF
    const pdfBlob =
      blob.type === 'application/pdf'
        ? blob
        : new Blob([blob], { type: 'application/pdf' })

    // 3️⃣ 创建 objectURL
    objectUrl = URL.createObjectURL(pdfBlob)
    pdfUrl.value = objectUrl
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
  }
})
</script>

<style scoped>
.pdf-frame {
  width: 100%;
  height: 100%;
}
</style>
