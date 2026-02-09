<template>
  <div class="preview-page">
    <!-- 顶部工具栏 -->
    <!-- <div class="toolbar">
      <el-button type="primary" @click="download" :disabled="!fileBlob">
        下载
      </el-button>
    </div> -->

    <!-- 内容区 -->
    <div class="content">
      <el-skeleton v-if="loading" animated />
      <component
        v-else
        :is="previewComponent"
        :blob="fileBlob"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { previewDutyLog } from '@/api/duty/dutyman.js'

import PdfPreview from './PdfPreview.vue'
import DocxPreview from './DocxPreview.vue'
const props = defineProps({
  iframeUrl: String,
  name: String
})

const route = useRoute()
const fileType = ref('pdf') // 默认类型
// 例如：/preview?dutyId=123&type=pdf
// const fileType = route.query.type      // pdf / docx
// const query = { dutyId: route.query.dutyId }

const loading = ref(true)
const fileBlob = ref(null)

const previewComponent = computed(() => {
  if (fileType.value === 'pdf') return PdfPreview
  return DocxPreview
  // return null
})

const loadFile = async () => {
  if(! props.iframeUrl) {
    loading.value = false
    return
  }
  loading.value = true
  props.iframeUrl.split('.').pop().toLowerCase() === 'pdf' ? fileType.value = 'pdf' : fileType.value = 'docx'
  try {
    const res = await previewDutyLog(props.iframeUrl)
    fileBlob.value = res
  } finally {
    loading.value = false
  }
}

const download = () => {
  const url = URL.createObjectURL(fileBlob.value)
  const a = document.createElement('a')
  a.href = url
  a.download = props.name || 'file'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(loadFile)
watch(
  () => props.iframeUrl,
  () => {
    loadFile()
  },
  { immediate: true }
)
</script>

<style scoped>
.preview-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.content {
  flex: 1;
  overflow: auto;
  padding: 16px;
  background: #f5f7fa;
}
</style>
