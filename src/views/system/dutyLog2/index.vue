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
      <el-table-column prop="addTime" label="上传时间" />
      <el-table-column prop="fileName" label="文件名称" />
      <el-table-column prop="addPerson" label="上传人" />

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

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="值班人员" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>

        <el-form-item label="职务" prop="position">
          <el-input v-model="formData.position" />
        </el-form-item>

        <el-form-item label="值班席位" prop="seat">
          <el-input v-model="formData.seat" />
        </el-form-item>

        <el-form-item label="执勤小队" prop="team">
          <el-input v-model="formData.team" />
        </el-form-item>

        <el-form-item label="值班时间" prop="dutyTime">
          <el-date-picker
            v-model="formData.dutyTime"
            type="date"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="submitForm">
          确定
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>
<script setup>
import { ref, reactive,onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

onMounted(() => {
  // getFilesList() // 页面初始化时获取文件列表
})

/* 搜索条件 */
const searchForm = reactive({
  date: '',
  name: ''
})

/* 表格数据（后期换接口） */
const tableData = ref([
  {
    addTime: '2026-02-01',
    addPerson: '值班组长',
    fileName: '1号席位',
  }
])

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

const getFilesList = async () => {
  try {
    const response = await fetch('/api/files/list') // 根据实际API地址调整
    if (response.ok) {
      const data = await response.json()
      tableData.value = data // 根据实际API返回结构调整
    } else {
      throw new Error('获取文件列表失败')
    }
  } catch (error) {
    console.error('获取文件列表错误:', error)
    ElMessage.error('获取文件列表失败')
  }
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
      // 创建 FormData 对象
      const formData = new FormData();
      formData.append('file', file);
      
      // 添加记录信息到 FormData
      const recordInfo = {
        fileName: file.name,
        addTime: new Date().toISOString().split('T')[0],
        addPerson: '当前用户' // 实际应用中应从用户信息获取
      };
      formData.append('recordInfo', JSON.stringify(recordInfo));

      // 执行文件上传请求（需要根据实际后端API调整）
      const response = await fetch('/api/file/upload', {
        method: 'POST',
        body: formData,
        // 如果需要身份验证，可以添加 headers
        // headers: {
        //   // Authorization: `Bearer ${token}`
        // }
      });

      if (response.ok) {
        const result = await response.json();
        
        // 添加上传记录到表格数据
        tableData.value.unshift({
          addTime: recordInfo.addTime,
          fileName: file.name,
          addPerson: recordInfo.addPerson
        });

        ElMessage.success(`文件 "${file.name}" 上传成功`);
      } else {
        throw new Error(`上传失败: ${response.statusText}`);
      }
    } catch (error) {
      console.error('文件上传错误:', error);
      ElMessage.error(`文件 "${file.name}" 上传失败: ${error.message}`);
    }
  }
};

const showDetails = (row) => {
  ElMessage.info(`查看文件详情: ${row.fileName}`)
}
/* 删除 */
const deleteRow = (row) => {
  ElMessageBox.confirm('确认删除该值班信息表吗？', '提示', {
    type: 'warning'
  }).then(() => {
    tableData.value = tableData.value.filter(item => item.id !== row.id)
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
