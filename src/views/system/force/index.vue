<template>
  <div class="duty-page">

    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="任务时间">
        <el-date-picker
          v-model="searchForm.timeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="任务名称">
        <el-input
          v-model="searchForm.rwmc"
          placeholder="请输入任务名称"
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
      <el-button type="primary" @click="openAddDialog">
        新增任务
      </el-button>
    </div>

    <!-- 排班表格 -->
    <el-table
      :data="tableData"
      border
      stripe
      style="width: 100%"
      :scrollbar-always-on="true"
    >
      <el-table-column prop="rwmc" label="任务名称" />
      <el-table-column prop="rwly" label="任务来源" />
      <el-table-column prop="xqdws" label="需求单位（师单位）" />
      <el-table-column prop="xqdw" label="需求单位" />
      <el-table-column prop="rwlx" label="任务类型" />
      <el-table-column prop="startTime" label="任务开始时间" />
      <el-table-column prop="endTime" label="任务结束时间" />
      <el-table-column prop="ts" label="任务天数" />
      <el-table-column prop="rs" label="执行任务人数" />
      <el-table-column prop="jtrw" label="具体任务" />
      <el-table-column prop="rwdy" label="执行任务地域" />
      <el-table-column prop="pzybdw" label="批准用兵单位" />
      <el-table-column prop="pzybwj" label="批准用兵文件名称" />
      <el-table-column prop="fwzh" label="发文字号" />
      <el-table-column prop="zhdw" label="指挥单位" />
      <el-table-column prop="zhyxm" label="指挥员姓名职务以及联系方式" />

      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            @click="editRow(row)"
          >
            修改
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
      width="800px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="140px"
        :inline="false"
      >
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="任务名称" prop="rwmc">
              <el-input v-model="formData.rwmc" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务来源" prop="rwly">
              <el-input v-model="formData.rwly" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="需求单位（师单位）" prop="xqdws">
              <el-input v-model="formData.xqdws" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需求单位" prop="xqdw">
              <el-input v-model="formData.xqdw" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="任务类型" prop="rwlx">
              <el-input v-model="formData.rwlx" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="date"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="date"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务天数" prop="ts">
              <el-input v-model="formData.ts" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="执行任务人数" prop="rs">
              <el-input v-model="formData.rs" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="具体任务" prop="jtrw">
              <el-input v-model="formData.jtrw" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="执行任务地域" prop="rwdy">
              <el-input v-model="formData.rwdy" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="批准用兵单位" prop="pzybdw">
              <el-input v-model="formData.pzybdw" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="批准用兵文件名称" prop="pzybwj">
              <el-input v-model="formData.pzybwj" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发文字号" prop="fwzh">
              <el-input v-model="formData.fwzh" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="指挥员姓名职务以及联系方式" prop="zhyxm">
              <el-input v-model="formData.zhyxm" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 占位空列，如果需要 -->
          </el-col>
        </el-row>
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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

/* 搜索条件 */
const searchForm = reactive({
  timeRange: [],
  任务名称: ''
})

/* 表格数据（后期换接口） */
const tableData = ref([
  {
    id: 1,
    rwmc: '紧急救援任务',
    rwly: '上级指挥部',
    xqdws: '第一师',
    xqdw: '作战一营',
    rwlx: '救援任务',
    startTime: '2024-01-15',
    endTime: '2024-01-20',
    ts: '5',
    rs: '12',
    jtrw: '山地搜救行动',
    rwdy: 'A区域山区',
    pzybdw: '军区司令部',
    pzybwj: '军令字第2024001号',
    fwzh: '军字[2024]第001号',
    zhdw: '第三指挥所',
    zhyxm: '李指挥长 13800138000'
  }
])

/* 搜索 */
const handleSearch = () => {
  console.log('搜索条件', searchForm)
  // 调接口
}

const resetSearch = () => {
  searchForm.timeRange = []
  searchForm.name = ''
}

/* 弹窗 */
const dialogVisible = ref(false)
const dialogTitle = ref('新增值班人员')

const formRef = ref(null)
const formData = reactive({
  id: null,
  rwmc: '',           
  rwly: '',           
  xqdws: '',          
  xqdw: '',           
  rwlx: '',          
  startTime: '',      
  endTime: '',        
  ts: '',             
  rs: '',             
  jtrw: '',           
  rwdy: '',          
  pzybdw: '',         
  pzybwj: '',         
  fwzh: '',           
  zhdw: '',           
  zhyxm: '' 
})

/* 校验规则 */
const rules = {
  name: [{ required: true, message: '请输入人员名称', trigger: 'blur' }],
  position: [{ required: true, message: '请输入职务', trigger: 'blur' }],
  seat: [{ required: true, message: '请输入值班席位', trigger: 'blur' }],
  team: [{ required: true, message: '请输入执勤小队', trigger: 'blur' }],
  dutyTime: [{ required: true, message: '请选择值班时间', trigger: 'change' }]
}

/* 新增 */
const openAddDialog = () => {
  dialogTitle.value = '新增值班人员'
  Object.assign(formData, {
    id: null,
    rwmc: '',           
    rwly: '',           
    xqdws: '',          
    xqdw: '',           
    rwlx: '',          
    startTime: '',      
    endTime: '',        
    ts: '',             
    rs: '',             
    jtrw: '',           
    rwdy: '',          
    pzybdw: '',         
    pzybwj: '',         
    fwzh: '',           
    zhdw: '',           
    zhyxm: '' 
  })
  dialogVisible.value = true
}

/* 编辑 */
const editRow = (row) => {
  debugger
  dialogTitle.value = '修改值班信息'
  Object.assign(formData, row)
  dialogVisible.value = true
}

/* 提交 */
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (!valid) return

    if (formData.id) {
      ElMessage.success('修改成功')
    } else {
      formData.id = Date.now()
      tableData.value.push({ ...formData })
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
  })
}

/* 删除 */
const deleteRow = (row) => {
  ElMessageBox.confirm('确认删除该值班人员吗？', '提示', {
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
