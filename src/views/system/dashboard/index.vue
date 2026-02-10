<template>
  <div class="duty-page">

    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="值班时间">
        <el-date-picker
            v-model="searchForm.startTime"
            placeholder="值班开始时间"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        <!-- <el-date-picker
          v-model="searchForm.timeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        /> -->
      </el-form-item>

      <el-form-item label="人员名称">
        <el-input
          v-model="searchForm.personName"
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
      <el-table-column prop="personName" label="值班人员" />
      <el-table-column prop="personType" label="人员类别" />
      <el-table-column prop="deptName" label="单位" />
      <el-table-column prop="duty" label="职务" />
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
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="值班人员" prop="personName">
          <el-input v-model="formData.personName" />
        </el-form-item>
        <el-form-item label="人员类别" prop="personType">
          <el-select 
            v-model="formData.personType" 
            placeholder="请选择人员类型"
            style="width: 100%"
          >
            <el-option
              v-for="seat in typeOptions"
              :key="seat.id"
              :label="seat.label"
              :value="seat.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="单位" prop="deptId">
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

        <el-form-item label="职位" prop="duty">
          <el-input v-model="formData.duty" />
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

        

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="formData.contactPhone" />
        </el-form-item>

        <el-form-item label="值班分队" prop="dutyTeam">
          <el-input v-model="formData.dutyTeam" />
        </el-form-item>

        <el-form-item label="人数" prop="personNum">
          <el-input v-model="formData.personNum" />
        </el-form-item>

        <el-form-item label="负责人" prop="leader">
          <el-input v-model="formData.leader" />
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
import { listDept } from "@/api/system/dept"

const { proxy } = getCurrentInstance()
onMounted(() => {
  listDept().then(response => {
    deptOptions.value = proxy.handleTree(response.data, "deptId")
    deptOptions1.value = response.data
  })
  listGdPerson().then(res => {
    personnelOptions.value = res.map(item => {
      return {
        id: item.id,
        label: item.personName,
        value: item.id
      }
    })
  })
  getDutyList()
})

const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(0)

/* 搜索条件 */
const searchForm = reactive({
  startTime: '',
  personName: ''
})

/* 人员选项 */
const personnelOptions = ref([
  { id: 1, label: '张三', value: '张三' },
  { id: 2, label: '李四', value: '李四' },
  { id: 3, label: '王五', value: '王五' },
  { id: 4, label: '赵六', value: '赵六' }
])

const deptOptions = ref([])
const deptOptions1 = ref([])

/* 席位选项 */
const seatOptions = ref([
  { id: 1, label: '值班领导', value: '值班领导' },
  { id: 2, label: '值班领导助理', value: '值班领导助理' },
  { id: 3, label: '值班员', value: '值班员' },
  { id: 3, label: '主值班员', value: '主值班员' },
  { id: 4, label: '副值班员', value: '副值班员' }
])

const typeOptions = ref([
  { id: 1, label: '现役', value: '现役' },
  { id: 2, label: '文职', value: '文职' },
])

/* 表格数据（后期换接口） */
const tableData = ref([
  {
    id: 1,
    personName: '张三',
    deptId: '单位A',
    dutyTeam: '一小队',
    startTime: '2026-02-01 08:00:00',
    endTime: '2026-02-01 18:00:00',
    personNum: '5',
    seatName: '1号席位',
    seatPhone: '010-12345678',
    leader: '李四',
    contactPhone: '13800138000',
    personType: '现役',
    duty: '部长'
  }
])

const handleSizeChange = (val) => {
  pageSize.value = val
  getDutyList()
}
const handleCurrentChange = (val) => {
  currentPage.value = val
  getDutyList()
}
const getDutyList = () => {
  queryDuty({
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  }).then(res => {
    //  tableData.value = res.list.map(item => {
    //   // 根据 personId 查找对应的人员名称
    //   const matchedPerson = personnelOptions.value.find(person => person.id === item.id)
    //   debugger
    //   const matchedDept = deptOptions1.value.find(dept => dept.deptId === item.deptId)
    //   // 返回新对象，包含原有字段和新增的 personName 字段
    //   return {
    //     ...item,
    //     personName: matchedPerson ? matchedPerson.label : '未知人员' ,// 默认值处理
    //     deptName: matchedDept ? matchedDept.deptName : '未知单位'
    //   }
    // })
    tableData.value = res.list
    currentPage.value = res.pageNum
    pageSize.value = res.pageSize
    total.value = res.total
  })
}

/* 搜索 */
const handleSearch = () => {
  console.log('搜索条件', searchForm)
  queryDuty({
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    ...searchForm
  }).then(res => {
    //  tableData.value = res.list.map(item => {
    //   // 根据 personId 查找对应的人员名称
    //   const matchedPerson = personnelOptions.value.find(person => person.id === item.personId)
    //   const matchedDept = deptOptions1.value.find(dept => dept.deptId === item.deptId)
    //   // 返回新对象，包含原有字段和新增的 personName 字段
    //   return {
    //     ...item,
    //     personName: matchedPerson ? matchedPerson.label : '未知人员' ,// 默认值处理
    //     deptName: matchedDept ? matchedDept.deptName : '未知单位'
    //   }
    // })
    tableData.value = res.list
    currentPage.value = res.pageNum
    pageSize.value = res.pageSize
    total.value = res.total
  })
  // 调接口
}

const resetSearch = () => {
  searchForm.startTime = ''
  searchForm.personName = ''
  getDutyList()
}

/* 弹窗 */
const dialogVisible = ref(false)
const dialogTitle = ref('新增值班人员')

const formRef = ref(null)
const formData = reactive({
  id: null,
  personName: '',
  deptId: '',
  seatName: '',
  seatPhone: '',
  leader: '',
  contactPhone: '',
  dutyTeam: '',
  personNum: '',
  startTime: '',
  endTime: '',
    personType: '',
    duty: ''
    
})

/* 校验规则 */
const rules = {
  personName: [{ required: true, message: '请选择值班人员', trigger: 'change' }],
  deptId: [{ required: true, message: '请输入单位', trigger: 'blur' }],
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
    personName: '',
    deptId: '',
    seatName: '',
    seatPhone: '',
    leader: '',
    contactPhone: '',
    dutyTeam: '',
    personNum: '',
    startTime: '',
    endTime: '',
    personType: '',
    duty: ''
  })
  dialogVisible.value = true
}
/**
 * 判断当前时间是否超出可修改时间
 * @param {string} startTime - 值班开始时间（格式：YYYY-MM-DD HH:mm:ss）
 * @returns {boolean} - true 表示超出可修改时间，false 表示未超出
 */
const isBeyondEditableTime = (startTime) => {
  if (!startTime) return false // 如果没有开始时间，默认允许修改

  const start = new Date(startTime) // 值班开始时间
  const now = new Date() // 当前时间

  // 计算开始时间前一周的周五中午12点
  const oneWeekBeforeStart = new Date(start)
  oneWeekBeforeStart.setDate(oneWeekBeforeStart.getDate() - 7) // 减去7天

  // 获取该周的周五
  const dayOfWeek = oneWeekBeforeStart.getDay() // 0=周日, 1=周一, ..., 6=周六
  const daysToFriday = dayOfWeek === 0 ? 5 : (5 - dayOfWeek) // 距离周五的天数
  const fridayNoon = new Date(oneWeekBeforeStart)
  fridayNoon.setDate(fridayNoon.getDate() + daysToFriday)
  fridayNoon.setHours(12, 0, 0, 0) // 设置为中午12点

  // 判断当前时间是否在周五中午12点之后
  return now > fridayNoon
}
/* 编辑 */
const editRow = (row) => {
  // if (isBeyondEditableTime(row.startTime)) {
  //   ElMessageBox.confirm(
  //     '超出可修改时间，是否需要提交审核？',
  //     '提示',
  //     {
  //       confirmButtonText: '确认',
  //       cancelButtonText: '取消',
  //       type: 'warning'
  //     }
  //   )
  //     .then(() => {
  //       dialogTitle.value = '修改值班信息'
  // Object.assign(formData, row)
  // dialogVisible.value = true
  //       // 用户点击“确认”按钮后的逻辑
  //       // ElMessage.info('已提交审核') 
  //       // 这里可以调用提交审核的接口或其他逻辑
        
  //     })
  //     .catch(() => {
  //       // 用户点击“取消”按钮后的逻辑
  //       ElMessage.info('已取消操作')
  //     })
  //   return
  // }
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
