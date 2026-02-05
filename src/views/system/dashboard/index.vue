<template>
  <div class="duty-page">

    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="值班时间">
        <el-date-picker
          v-model="searchForm.timeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
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
      <el-button type="primary" @click="openAddDialog">
        新增值班人员
      </el-button>
    </div>

    <!-- 排班表格 -->
    <el-table
      :data="tableData"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="personId" label="值班人员" />
      <el-table-column prop="deptId" label="单位" />
      <el-table-column prop="dutyTeam" label="值班分队" />
      <el-table-column prop="startTime" label="开始时间" />
      <el-table-column prop="endTime" label="结束时间" />
      <el-table-column prop="personNum" label="人数" />
      <el-table-column prop="seatName" label="值班席位" />
      <el-table-column prop="seatPhone" label="席位电话" />
      <el-table-column prop="leader" label="负责人" />
      <el-table-column prop="contactPhone" label="联系人电话" />

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
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="值班人员" prop="personId">
          <el-select 
            v-model="formData.personId" 
            placeholder="请选择值班人员"
            style="width: 100%"
          >
            <el-option
              v-for="person in personnelOptions"
              :key="person.id"
              :label="person.label"
              :value="person.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="单位id" prop="deptId">
          <el-input v-model="formData.deptId" />
        </el-form-item>

        <el-form-item label="值班席位" prop="seatName">
          <el-select 
            v-model="formData.seatName" 
            placeholder="请选择值班席位"
            style="width: 100%"
          >
            <el-option
              v-for="seat in seatOptions"
              :key="seat.id"
              :label="seat.label"
              :value="seat.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="席位电话" prop="seatPhone">
          <el-input v-model="formData.seatPhone" />
        </el-form-item>

        <el-form-item label="负责人" prop="leader">
          <el-input v-model="formData.leader" />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="formData.contactPhone" />
        </el-form-item>

        <el-form-item label="值班分队" prop="dutyTeam">
          <el-input v-model="formData.dutyTeam" />
        </el-form-item>

        <el-form-item label="人数" prop="personNum">
          <el-input v-model="formData.personNum" />
        </el-form-item>


        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="formData.startTime"
            placeholder="值班开始时间"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            placeholder="值班结束时间"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { saveDuty, queryDuty, deleteDuty, listGdPerson } from '@/api/duty'

onMounted(() => {
  listGdPerson().then(res => {
    personnelOptions.value = res.map(item => {
      return {
        id: item.id,
        label: item.personName,
        value: item.personName
      }
    })
  })
  getDutyList()
})

const pageSize = ref(10)
const currentPage = ref(1)
/* 搜索条件 */
const searchForm = reactive({
  timeRange: [],
  name: ''
})

/* 人员选项 */
const personnelOptions = ref([
  { id: 1, label: '张三', value: '张三' },
  { id: 2, label: '李四', value: '李四' },
  { id: 3, label: '王五', value: '王五' },
  { id: 4, label: '赵六', value: '赵六' }
])

/* 席位选项 */
const seatOptions = ref([
  { id: 1, label: '1号席位', value: '1号席位' },
  { id: 2, label: '2号席位', value: '2号席位' },
  { id: 3, label: '3号席位', value: '3号席位' },
  { id: 4, label: '4号席位', value: '4号席位' }
])

/* 表格数据（后期换接口） */
const tableData = ref([
  {
    id: 1,
    personId: '张三',
    deptId: '单位A',
    dutyTeam: '一小队',
    startTime: '2026-02-01 08:00:00',
    endTime: '2026-02-01 18:00:00',
    personNum: '5',
    seatName: '1号席位',
    seatPhone: '010-12345678',
    leader: '李四',
    contactPhone: '13800138000'
  }
])

const getDutyList = () => {
  queryDuty({
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  }).then(res => {
    tableData.value = res.list
    currentPage.value = res.currentPage
    pageSize.value = res.pageSize
  })
}

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
  personId: '',
  deptId: '',
  seatName: '',
  seatPhone: '',
  leader: '',
  contactPhone: '',
  dutyTeam: '',
  personNum: '',
  startTime: '',
  endTime: ''
})

/* 校验规则 */
const rules = {
  personId: [{ required: true, message: '请选择值班人员', trigger: 'change' }],
  deptId: [{ required: true, message: '请输入单位ID', trigger: 'blur' }],
  seatName: [{ required: true, message: '请选择值班席位', trigger: 'change' }],
  seatPhone: [{ required: true, message: '请输入席位电话', trigger: 'blur' }],
  leader: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  dutyTeam: [{ required: true, message: '请输入值班分队', trigger: 'blur' }],
  personNum: [
    { required: true, message: '请输入人数', trigger: 'blur' },
    { pattern: /^\d+$/, message: '请输入有效数字', trigger: 'blur' }
  ],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

/* 新增 */
const openAddDialog = () => {
  dialogTitle.value = '新增值班人员'
  Object.assign(formData, {
    id: null,
    personId: '',
    deptId: '',
    seatName: '',
    seatPhone: '',
    leader: '',
    contactPhone: '',
    dutyTeam: '',
    personNum: '',
    startTime: '',
    endTime: ''
  })
  dialogVisible.value = true
}

/* 编辑 */
const editRow = (row) => {
  dialogTitle.value = '修改值班信息'
  Object.assign(formData, row)
  dialogVisible.value = true
}

/* 提交 */
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (!valid) return

    if (formData.id) {
      let params = { ...formData }
      saveDuty(params).then(res => {
          getDutyList()
        ElMessage.success('修改成功')
      })
    } else {
      let params = { ...formData }
      saveDuty(params).then(res => {
        getDutyList()
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
    deleteDuty(row.id).then(res => {
      getDutyList()
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
