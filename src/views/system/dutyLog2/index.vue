<template>
  <div class="duty-page">

    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="值班时间">
        <el-date-picker
          v-model="searchForm.date"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="人员名称">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入人员名称"
          clearable
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          查询
        </el-button>
        <el-button @click="resetSearch">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="addDuty">
        新增值班信息表
      </el-button>
    </div>

    <!-- 排班表格 -->
    <el-table
      :data="tableData"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="uploadTime" label="上传时间" />
      <el-table-column prop="fileName" label="文件名称" />
      <el-table-column prop="uploader" label="上传人" />

      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            @click="showDetails(row)"
          >
            详情
          </el-button>
          <el-button
            type="danger"
            link
            @click="deleteRow(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="pdfDialogVisible" title="文件预览" width="80%" top="5vh">
      <ShowPdf v-if="pdfDialogVisible" :iframe-url="currentPdfBlob" :name="currentFileName" />
    </el-dialog>
   
  </div>
</template>
<script setup>
import { ref, reactive,onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { saveDutyLog, queryDutyLog, deleteDutyLog, downloadDutyLog } from '@/api/duty'
import ShowPdf from '@/components/showpdf.vue'

const pdfDialogVisible = ref(false)
const currentPdfBlob = ref(null)
const currentFileName = ref('')

onMounted(() => {
  getFilesList() // 页面初始化时获取文件列表
})

const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(0)

/* 搜索条件 */
const searchForm = reactive({
  date: '',
  name: ''
})

/* 表格数据（后期换接口） */
const tableData = ref([
  {
    uploadTime: '2026-02-01',
    uploader: '值班组长',
    fileName: '1号席位',
  }
])

const getFilesList = () => {
  queryDutyLog({
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  }).then(res => {
    tableData.value = res.list
    currentPage.value = res.pageNum
    pageSize.value = res.pageSize
    total.value = res.total
  })
}

/* 搜索 */
const handleSearch = async () => {
  // console.log('搜索条件', searchForm)
  // 调接口
  try {
    const params = new URLSearchParams()
    if (searchForm.date) params.append('date', searchForm.date)
    if (searchForm.name) params.append('name', searchForm.name)
    
    const response = await fetch(`/api/files/search?${params}`)
    if (response.ok) {
      const data = await response.json()
      tableData.value = data // 根据实际API返回结构调整
    } else {
      throw new Error('搜索失败')
    }
  } catch (error) {
    console.error('搜索错误:', error)
    ElMessage.error('搜索失败')
  }
}

const resetSearch = () => {
  searchForm.date = ''
  searchForm.name = ''
  getFilesList()
}



const addDuty = () => {
  // 创建隐藏的文件输入框
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '*/*'; // 不限制文件类型
  input.multiple = true; // 允许选择多个文件
  input.onchange = handleFileUpload;
  input.click();
};

const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files);

  if (files.length === 0) return;

  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      console.log('上传文件', formData);
      const now = new Date();
      const uploadTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      formData.append('uploadTime', uploadTime);
      // const uploadTime = new Date().toISOString().replace(/\.(\d{3})Z$/, ''); ; // 输出: "2026-02-05T14:00:34.123Z"
      // formData.append('uploadTime', uploadTime);
      formData.append('uploader', '当前用户');
      console.log('上传参数', formData);
      debugger

      // 调用 API
      const response = await saveDutyLog(formData).then(res => { 
        getFilesList()
});

      // if (response.success) {
      //   tableData.value.unshift({
      //     addTime: formData.get('uploadTime'),
      //     fileName: formData.get('fileName'),
      //     addPerson: formData.get('uploader')
      //   });
      //   ElMessage.success(`文件 "${file.name}" 上传成功`);
      // } else {
      //   ElMessage.error(`上传失败: ${response.message}`);
      // }
    } catch (error) {
      console.error('上传错误:', error);
      ElMessage.error(`文件 "${file.name}" 上传失败`);
    }
  }
};

const showDetails = async (row) => {
  try {
    // 调用下载接口获取文件 Blob
    // const response = await downloadDutyLog(row.filePath)

    // const url = window.URL.createObjectURL(new Blob([response]));
    // const link = document.createElement('a');
    // link.href = url;
    // link.setAttribute('download', row.fileName || 'download'); // 设置文件名
    // document.body.appendChild(link);
    // link.click();
    // link.remove();
    // window.URL.revokeObjectURL(url);
    const response = await downloadDutyLog(row.filePath)

    // 设置弹窗数据
    // currentPdfBlob.value = response
    // currentFileName.value = row.fileName
    // pdfDialogVisible.value = true // 打开弹窗
  } catch (error) {
    console.error('文件加载失败:', error)
    ElMessage.error('文件加载失败')
  }
}
/* 删除 */
const deleteRow = (row) => {
  ElMessageBox.confirm('确认删除该值班信息表吗？', '提示', {
    type: 'warning'
  }).then(() => {
    deleteDutyLog(row.id).then(res => {
      getFilesList()
    })
    ElMessage.success('删除成功')
  })
}
</script>
<style scoped lang="scss">
.duty-page {
  padding: 16px;
}

.search-form {
  margin-bottom: 16px;
}

.toolbar {
  margin-bottom: 16px;
  text-align: right;
}
</style>
