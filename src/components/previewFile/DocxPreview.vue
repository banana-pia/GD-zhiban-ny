<template>
  <div ref="container" class="docx-container"></div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { renderAsync } from 'docx-preview'

const props = defineProps({
  blob: { type: Blob, required: true }
})

const container = ref(null)

const renderDocx = async () => {
  container.value.innerHTML = ''
  await renderAsync(props.blob, container.value)
}

watch(() => props.blob, renderDocx, { immediate: true })
</script>

<style scoped>
.docx-container {
  background: #fff;
  padding: 16px;
}
</style>
