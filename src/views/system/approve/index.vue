<template>
  <div class="duty-page">

    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <!-- <el-form-item label="值班时间">
        <el-date-picker
            v-model="searchForm.startTime"
            placeholder="值班开始时间"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
      </el-form-item> -->

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
    <!-- <div class="toolbar">
      <el-button type="primary" @click="openAddDialog">
        新增值班人员
      </el-button>
    </div> -->

    <!-- 排班表格 -->
    <el-table
      :data="tableData"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="personName" label="值班人员" />
      <el-table-column prop="deptName" label="单位" />
      <el-table-column prop="dutyTeam" label="值班分队" />
      <el-table-column prop="startTime" label="开始时间" />
      <el-table-column prop="endTime" label="结束时间" />
      <el-table-column prop="personNum" label="人数" />
      <el-table-column prop="seatName" label="值班席位" />
      <el-table-column prop="seatPhone" label="席位电话" />
      <el-table-column prop="leader" label="负责人" />
      <el-table-column prop="contactPhone" label="联系人电话" />
      <el-table-column prop="status" label="审核状态" />

      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button
          v-if="row.canAudit"
            type="primary"
            link
            @click="pass(row)"
          >
            通过
          </el-button>
          <el-button
          v-if="row.canAudit"
            type="danger"
            link
            @click="veto(row)"
          >
            驳回
          </el-button>
          <el-button
          v-if="!row.canAudit"
            type="primary"
            link
            disabled
            :style="{ color: 'gray', cursor: 'not-allowed' }"
          >
            通过
          </el-button>
          <el-button
          v-if="!row.canAudit"
            type="danger"
            link
            disabled
            :style="{ color: 'gray', cursor: 'not-allowed' }"
          >
            驳回
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



  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { approve, queryApprove, deleteDuty, listGdPerson } from '@/api/duty'
import { listDept } from "@/api/system/dept"

const { proxy } = getCurrentInstance()
onMounted(() => {
  // listDept().then(response => {
  //   deptOptions.value = proxy.handleTree(response.data, "deptId")
  //   deptOptions1.value = response.data
  // })
  // listGdPerson().then(res => {
  //   personnelOptions.value = res.map(item => {
  //     return {
  //       id: item.id,
  //       label: item.personName,
  //       value: item.id
  //     }
  //   })
  // })
   getApproveList()
})

const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(0)

/* 搜索条件 */
const searchForm = reactive({
  // startTime: '',
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
  { id: 2, label: '领导助理', value: '领导助理' },
  { id: 3, label: '主值班员', value: '主值班员' },
  { id: 4, label: '辅助值班员', value: '辅助值班员' }
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

const handleSizeChange = (val) => {
  pageSize.value = val
   getApproveList()
}
const handleCurrentChange = (val) => {
  currentPage.value = val
   getApproveList()
}
const getApproveList = () => {
  queryApprove({
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  }).then(res => {
     tableData.value = res.list.map(item => {
  // 判断 auditStatus 并设置 status 字段
  let status = '';
  switch (item.auditStatus) {
    case 0:
      status = '未审核';
      break;
    case 1:
      status = '审核通过';
      break;
    case -1:
      status = '未通过';
      break;
    default:
      status = '未知状态';
  }

  // 返回新对象，包含原有字段和新增的 status 字段
  return {
    ...item,
    status
  };
});
    currentPage.value = res.pageNum
    pageSize.value = res.pageSize
    total.value = res.total
  })
}

/* 搜索 */
const handleSearch = () => {
  console.log('搜索条件', searchForm)
  queryApprove({
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    ...searchForm
  }).then(res => {
     tableData.value = res.list.map(item => {
      // 根据 personId 查找对应的人员名称
      const matchedPerson = personnelOptions.value.find(person => person.id === item.personId)
      const matchedDept = deptOptions1.value.find(dept => dept.deptId === item.deptId)
      // 返回新对象，包含原有字段和新增的 personName 字段
      return {
        ...item,
        personName: matchedPerson ? matchedPerson.label : '未知人员' ,// 默认值处理
        deptName: matchedDept ? matchedDept.deptName : '未知单位'
      }
    })
    currentPage.value = res.pageNum
    pageSize.value = res.pageSize
  })
  // 调接口
}

const resetSearch = () => {
  // searchForm.startTime = ''
  searchForm.personName = ''
   getApproveList()
}






const pass = (row) => {

  approve({
    dutyId: row.id,
    auditStatus: 1
  }).then(res => {
     getApproveList()
  })
  
  // dialogTitle.value = '修改值班信息'
  // Object.assign(formData, row)
  // dialogVisible.value = true
}




const veto = (row) => {
  approve({
    dutyId: row.id,
    auditStatus: -1
  }).then(res => {
     getApproveList()
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
