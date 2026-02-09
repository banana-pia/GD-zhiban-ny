<template>
  <div ref="container" class="pdf-container"></div>
</template>

<script setup>
import { ref, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const props = defineProps({
  blob: { type: Blob, required: true }
})

const container = ref(null)

const renderPdf = async () => {
  container.value.innerHTML = ''

  const url = URL.createObjectURL(props.blob)
  const pdf = await pdfjsLib.getDocument(url).promise

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.4 })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({ canvasContext: ctx, viewport }).promise
    container.value.appendChild(canvas)
  }

  URL.revokeObjectURL(url)
}

watch(() => props.blob, renderPdf, { immediate: true })
</script>

<style scoped>
.pdf-container canvas {
  display: block;
  margin: 0 auto 16px;
}
</style>
