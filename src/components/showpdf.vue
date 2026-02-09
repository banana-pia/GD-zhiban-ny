<template>
  <div class="main">
    <div class="no-data" v-if="!pdfSource">
      暂无数据
    </div>
    <div v-if="pdfSource"  id="vue-pdf-view">
      <div id="page-view">
        <!-- <VuePdfEmbed v-if="docuCype == 'pdf'" :page="currentPage"  @loaded="onPdfLoaded" text-layer :source="pdfSource"></VuePdfEmbed> -->
        <iframe :src="pdfSource" width="100%" height="100%" frameborder="0" style="border: none;" />
        <!-- <div v-if="docuCype == 'docx'" v-html="pdfSource"></div> -->

      </div>
    </div>
    <!-- <div class="pdf-controls" v-if="pdfSource">
      <button @click="goToPrevPage" :disabled="currentPage <= 1">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="goToNextPage" :disabled="currentPage >= totalPages">下一页</button>
      <button @click="downloadPdf">下载PDF</button>
    </div> -->

    <!-- <iframe  :src="pdfSource" frameborder="0"></iframe> -->
  </div>
</template>

<script setup>
import { defineProps, onBeforeMount, onMounted, ref, watch } from 'vue';
//引入vue-pdf
import VuePdfEmbed from 'vue-pdf-embed'
import mammoth from 'mammoth'

import 'vue-pdf-embed/dist/styles/annotationLayer.css'
import 'vue-pdf-embed/dist/styles/textLayer.css'

import { previewDutyLog } from '@/api/duty/dutyman.js'

// either URL, Base64, binary, or document proxy
// 解决部分文字不显示的问题
// import CMapReaderFactory from 'vue-pdf/src/CMapReaderFactory.js'

const propsData = defineProps(['iframeUrl','name']);
const totalPages = ref(0)
const currentPage = ref(1)
const pdfSource = ref('')
const docuCype = ref('pdf')

//预览图片
const previewImg = async(url) => {
  // const res = await fetch('/documents/zbjb.docx')
  // const arrayBuffer = await res.arrayBuffer()

  // const result = await mammoth.convertToHtml({ arrayBuffer })
  // pdfSource.value = result.value
  fetch('/documents/zbjb.pdf') // public 目录下
  .then(res => {
      if (!res.ok) throw new Error('PDF 加载失败')
      return res.blob()
    })
    .then(blob => {
      // Blob → URL
      pdfSource.value = URL.createObjectURL(blob)
    })
    .catch(err => {
      console.error('PDF 加载错误:', err)
      pdfSource.value = ''
    })
}


const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      debugger
      resolve(e.target.result);
    };
    // readAsDataURL
    fileReader.readAsDataURL(blob);
    fileReader.onerror = () => {
      reject(new Error('文件流异常'));
    };
  }).catch((err) => {
    pdfSource.value = ''
  });
}
const onPdfLoaded = (pdf) => {
  console.log(pdf.numPages)
  totalPages.value = pdf.numPages;
}
// 翻到上一页
const goToPrevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  // 翻到下一页
  const goToNextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };

  // 下载PDF文件
  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfSource.value;
    link.download = propsData.name;  // 设置下载文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
const getZdysx = () => {
  // let busLicContent = propsData.iframeUrl
  // let src = pdf.createLoadingTask({ url: busLicContent, CMapReaderFactory });
  // src.promise.then(pdf => {
  //   numPages.vue = pdf.numPages;
  // });
}
onMounted(() => {
  
  // pdfSource.value = propsData.iframeUrl
  if (!propsData.iframeUrl) {
    pdfSource.value = ''
    return
  }
  blobToBase64(propsData.iframeUrl).then((res) => {
    pdfSource.value = res
  })
  getZdysx();//获取配置文件yml属性
})
watch(
  () => propsData.iframeUrl,
  (val) => {
    currentPage.value = 1
    if (val) {
     val.split('.').pop().toLowerCase() === 'pdf' ? docuCype.value = 'pdf' : docuCype.value = 'docx'

      previewImg(val)
    }else{
       pdfSource.value = ''
    }

  }
)
</script>

<style lang="scss" scoped>
.main {
  width: 100%;
  height: 100%;

  // height: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  .hiddenCanvasElement {
    height: 0px
  }
}

.no-data {
  text-align: center;
  font-size: 50px;
  height: calc(100% - 60px);
  color: #eaeaea;
}

#vue-pdf-view {
  padding: 10px;
  background: #eaeaea;
  border-radius: 10px;
  // position: absolute;
  // left: 50%;
  // transform: translateX(-50%) scale(1.0);
  // width: 100%;
  height: calc(100% - 60px);
  text-align: center;
  box-sizing: border-box;
  /* 内容溢出显示滚动条 */
  overflow: scroll;
  /* 隐藏x、y轴滚动条 */
  overflow-y: hidden;
  overflow-x: hidden;

  canvas {
    width: 100%;
  }
}

#page-view {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 设置滚动栏的宽、高 */
#vue-pdf-view::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

/* 设置滚动条的样式 */
#vue-pdf-view::-webkit-scrollbar-thumb {
  border-radius: 15px;
  background-color: #eee;
}

/* 鼠标经过滚动条变换颜色 */
#vue-pdf-view::-webkit-scrollbar-thumb:hover {
  background-color: #CBCBFF;
}


.pdf-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.pdf-controls {
  display: flex;
  justify-content: right;
  align-items: center;
  margin-top: 10px;
  height: 40px;
  >span{
    font-size: 40px;
  }
}

button {
  height: 100%;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  margin: 0 10px;
}

button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
</style>
