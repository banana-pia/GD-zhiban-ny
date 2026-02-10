<template>
  <div class="duty-page">

    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <!-- <el-form-item label="任务时间">
        <el-date-picker
          v-model="searchForm.taskTimeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item> -->

      <el-form-item label="任务名称">
        <el-input
          v-model="searchForm.taskName"
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
      <el-table-column prop="taskName" label="任务名称" />
      <el-table-column prop="taskSource" label="任务来源" />
      <el-table-column prop="taskType" label="任务类型" />
      <el-table-column prop="demandUnitDivision" label="需求单位" />
      <el-table-column prop="deptName" label="需求单位（师单位）" />
      <el-table-column prop="month" label="月份" />
      <el-table-column prop="taskTimeStart" label="开始时间" />
      <el-table-column prop="taskTimeEnd" label="结束时间" />
      <el-table-column prop="days" label="任务天数" />
      <el-table-column prop="participantCount" label="执行任务人数" />
      <el-table-column prop="personDays" label="人·天" />
      <el-table-column prop="participantPersonType" label="执行任务人员类型" />
      <el-table-column prop="specificTask" label="具体任务" />
      <el-table-column prop="executionArea" label="执行任务地域" />
      <el-table-column prop="approveUnit" label="批准用兵单位" />
      <el-table-column prop="approveFileName" label="批准用兵文件名称" />
      <el-table-column prop="fileNumber" label="发文字号" />
      <el-table-column prop="commandUnit" label="指挥单位" />
      <el-table-column prop="commanderInfo" label="指挥员姓名职务以及联系方式" />

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
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 16px; text-align: right;"
    />

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
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
            <el-form-item label="任务名称" prop="taskName">
              <el-input v-model="formData.taskName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务来源" prop="taskSource">
              <el-input v-model="formData.taskSource" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="需求单位" prop="demandUnitDivision">
              <el-input v-model="formData.demandUnitDivision" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需求单位（师）" prop="deptId">
              <!-- <el-input v-model="formData.deptId" /> -->
            <el-tree-select
              v-model="formData.deptId"
              :data="deptOptions"
              :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
              value-key="deptId"
              placeholder="选择单位"
              check-strictly
            />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="任务类型" prop="taskType">
              <el-input v-model="formData.taskType" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月份" prop="month">
              <el-date-picker
                v-model="formData.month"
                type="month"
                value-format="YYYY-MM"
                placeholder="请选择月份"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="taskTimeStart">
              <el-date-picker
                v-model="formData.taskTimeStart"
                placeholder="开始时间"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="taskTimeEnd">
              <el-date-picker
                v-model="formData.taskTimeEnd"
                placeholder="结束时间"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="执行任务人数" prop="participantCount">
              <el-input v-model="formData.participantCount" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务天数" prop="days">
              <el-input v-model="formData.days" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="人·天" prop="personDays">
              <el-input v-model="formData.personDays" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="具体任务" prop="specificTask">
              <el-input v-model="formData.specificTask" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="执行任务地域" prop="executionArea">
              <el-input v-model="formData.executionArea" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="批准用兵单位" prop="approveUnit">
              <el-input v-model="formData.approveUnit" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="批准用兵文件名称" prop="approveFileName">
              <el-input v-model="formData.approveFileName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发文字号" prop="fileNumber">
              <el-input v-model="formData.fileNumber" />
            </el-form-item>
          </el-col>
        </el-row>

        

        <el-row :gutter="10">
          
          <el-col :span="12">
            <el-form-item label="指挥单位" prop="commandUnit">
              <el-input v-model="formData.commandUnit" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="指挥员姓名职务以及联系方式" prop="commanderInfo">
              <el-input v-model="formData.commanderInfo" />
            </el-form-item>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { saveMilitia, queryMilitia, deleteMilitia } from '@/api/duty'
import { listDept } from "@/api/system/dept"

const { proxy } = getCurrentInstance()

onMounted(() => {
  listDept().then(response => {
    deptOptions.value = proxy.handleTree(response.data, "deptId")
    deptOptions1.value = response.data
  })
  getMilitiaList()
})

const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(0)
const deptOptions = ref([])
const deptOptions1 = ref([])

/* 搜索条件 */
const searchForm = reactive({
  // taskTimeRange: [],
  taskName: ''
})

const seatOptions = ref([
  { id: 1, label: '现役', value: '现役' },
  { id: 2, label: '文职', value: '文职' },
  { id: 3, label: '民兵', value: '民兵' },
])

/* 表格数据（后期换接口） */
const tableData = ref([
  {
    id: null,
  taskName: '紧急救援任务',              // 任务名称
  taskSource: '上级指挥部',             // 任务来源
  demandUnitDivision: '第一师',          // 需求单位（师单位）
  deptId: '作战一营',                    // 需求单位
  taskType: '救援任务',                  // 任务类型
  commanderInfo: '李指挥长 13800138000', // 指挥员姓名职务以及联系方式
  taskTimeRange: ['2024-01-15', '2024-01-20'], // 任务时间范围（数组格式）
  days: '5',                             // 任务天数
  participantCount: '12',                // 执行任务人数
  specificTask: '山地搜救行动',           // 具体任务
  executionArea: 'A区域山区',            // 执行任务地域
  approveUnit: '军区司令部',             // 批准用兵单位
  approveFileName: '军令字第2024001号',  // 批准用兵文件名称
  fileNumber: '军字[2024]第001号',       // 发文字号
  month: '2024-01' ,   
  participantPersonType: '民兵', 
  taskTimeStart:'2024-01-15 10:00:00', 
  taskTimeEnd:'2024-01-20 10:00:00',
  personDays: '5',  
  commandUnit: '第一师',      
  }
])



/* 搜索 */
const handleSearch = () => {
  console.log('搜索条件', searchForm)
  // 调接口
  queryMilitia({
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    ...searchForm
  }).then(res => {
     tableData.value = res.list
     tableData.value = res.list.map(item => {
      // 根据 personId 查找对应的人员名称
      // const matchedPerson = personnelOptions.value.find(person => person.id === item.personId)
      const matchedDept = deptOptions1.value.find(dept => dept.deptId === item.deptId)
      // 返回新对象，包含原有字段和新增的 personName 字段
      return {
        ...item,
        // personName: matchedPerson ? matchedPerson.label : '未知人员' ,// 默认值处理
        deptName: matchedDept ? matchedDept.deptName : '未知单位'
      }
    })
    currentPage.value = res.pageNum
    pageSize.value = res.pageSize
  })
}

const resetSearch = () => {
  // searchForm.taskTimeRange = []
  searchForm.name = ''
}

/* 弹窗 */
const dialogVisible = ref(false)
const dialogTitle = ref('新增值班任务')

const formRef = ref(null)
const formData = reactive({
  id: null,
   taskName: '',                 // 任务名称
  taskSource: '',              // 任务来源
  demandUnitDivision: '',       // 需求单位（师单位）
  deptId: '',                   // 需求单位
  taskType: '',                 // 任务类型
  commanderInfo: '',            // 指挥员姓名职务以及联系方式
  taskTimeRange: [],                // 任务时间范围（绑定到 searchForm.taskTimeRange）
  days: '',                     // 任务天数
  participantCount: '',         // 执行任务人数
  specificTask: '',             // 具体任务
  executionArea: '',            // 执行任务地域
  approveUnit: '',              // 批准用兵单位
  approveFileName: '',          // 批准用兵文件名称
  fileNumber: '',                // 发文字号
  month:'',
  participantPersonType: '民兵',
  taskTimeStart:'', 
  taskTimeEnd:'', 
  personDays: '',
  commandUnit: '',
  
})

/* 校验规则 */
const rules = {
  taskName: [
    { required: true, message: '请输入任务名称', trigger: 'blur' }
  ],
  taskSource: [
    { required: true, message: '请输入任务来源', trigger: 'blur' }
  ],
  demandUnitDivision: [
    { required: true, message: '请输入需求单位', trigger: 'blur' }
  ],
  deptId: [
    { required: true, message: '请输入需求单位（师单位）', trigger: 'blur' }
  ],
  taskType: [
    { required: true, message: '请输入任务类型', trigger: 'blur' }
  ],
  month: [
    { required: true, message: '请选择月份', trigger: 'change' }
  ],
  taskTimeRange: [
    { required: true, message: '请选择任务时间范围', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (!value || value.length !== 2) {
          callback(new Error('请选择完整的日期范围'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  days: [
    { required: true, message: '请输入任务天数', trigger: 'blur' },
    { pattern: /^\d+$/, message: '请输入有效数字', trigger: 'blur' }
  ],
  participantCount: [
    { required: true, message: '请输入执行任务人数', trigger: 'blur' },
    { pattern: /^\d+$/, message: '请输入有效数字', trigger: 'blur' }
  ],
  specificTask: [
    { required: true, message: '请输入具体任务', trigger: 'blur' }
  ],
  executionArea: [
    { required: true, message: '请输入执行任务地域', trigger: 'blur' }
  ],
  approveUnit: [
    { required: true, message: '请输入批准用兵单位', trigger: 'blur' }
  ],
  approveFileName: [
    { required: true, message: '请输入批准用兵文件名称', trigger: 'blur' }
  ],
  fileNumber: [
    { required: true, message: '请输入发文字号', trigger: 'blur' }
  ],
  commanderInfo: [
    { required: true, message: '请输入指挥员姓名职务以及联系方式', trigger: 'blur' }
  ],
  participantPersonType: [
    { required: true, message: '请选择人员类别', trigger: 'blur' }
  ],
  taskTimeStart: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  taskTimeEnd: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  personDays: [
    { required: true, message: '请输入人员天数', trigger: 'blur' },
    { pattern: /^\d+$/, message: '请输入有效的整数', trigger: 'blur' }
  ],
  commandUnit: [
    { required: true, message: '请输入指挥单位', trigger: 'blur' }
  ],
}

/* 新增 */
const openAddDialog = () => {
  dialogTitle.value = '新增值班人员'
  Object.assign(formData, {
    id: null,
   taskName: '',                 // 任务名称
  taskSource: '',              // 任务来源
  demandUnitDivision: '',       // 需求单位（师单位）
  deptId: '',                   // 需求单位
  taskType: '',                 // 任务类型
  commanderInfo: '',            // 指挥员姓名职务以及联系方式
  taskTimeRange: [],                // 任务时间范围（绑定到 searchForm.taskTimeRange）
  days: '',                     // 任务天数
  participantCount: '',         // 执行任务人数
  specificTask: '',             // 具体任务
  executionArea: '',            // 执行任务地域
  approveUnit: '',              // 批准用兵单位
  approveFileName: '',          // 批准用兵文件名称
  fileNumber: '' ,               // 发文字号
  month:'',
  participantPersonType: '民兵',
  taskTimeStart:'', 
  taskTimeEnd:'', 
  personDays: '', 
  commandUnit: '',       
  })
  dialogVisible.value = true
}

const handleSizeChange = (val) => {
  pageSize.value = val
  getMilitiaList()
}
const handleCurrentChange = (val) => {
  currentPage.value = val
  getMilitiaList()
}


const getMilitiaList = () => {
  queryMilitia({
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  }).then(res => {
    tableData.value = res.list
     tableData.value = res.list.map(item => {
      // 根据 personId 查找对应的人员名称
      // const matchedPerson = personnelOptions.value.find(person => person.id === item.personId)
      const matchedDept = deptOptions1.value.find(dept => dept.deptId === item.deptId)
      // 返回新对象，包含原有字段和新增的 personName 字段
      return {
        ...item,
        // personName: matchedPerson ? matchedPerson.label : '未知人员' ,// 默认值处理
        deptName: matchedDept ? matchedDept.deptName : '未知单位'
      }
    })
    currentPage.value = res.pageNum
    pageSize.value = res.pageSize
    total.value = res.total
  })
}

/* 编辑 */
const editRow = (row) => {
  debugger
  dialogTitle.value = '修改值班信息'
  Object.assign(formData, row)
  // formData.taskTimeRange = formData.taskTimeRange.split(" - ");
  dialogVisible.value = true
}

/* 提交 */
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (!valid) return

    if (formData.id) {
      // formData.taskTimeRange = formData.taskTimeRange.join(' - ')
      debugger
      let params = { ...formData }
      saveMilitia(params).then(res => {
        getMilitiaList()
        ElMessage.success('修改成功')
      })
    } else {
      formData.taskTimeRange = formData.taskTimeRange.join(' - ')
      debugger
      let params = { ...formData }
      saveMilitia(params).then(res => {
        getMilitiaList()
        ElMessage.success('添加成功')
      })
      // formData.id = Date.now()
      // tableData.value.push({ ...formData })
      // ElMessage.success('新增成功')
    }

    dialogVisible.value = false
  })
}

/* 删除 */
const deleteRow = (row) => {
  ElMessageBox.confirm('确认删除该值班人员吗？', '提示', {
    type: 'warning'
  }).then(() => {
    deleteMilitia(row.id).then(res => {
      getMilitiaList()
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
