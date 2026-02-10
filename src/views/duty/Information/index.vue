<!-- page-name: 值班人员,author: huzhi,date: 2024.9.15, description:,-->
<template>
  <div class="duty-con">
    <div>
      <p>
        <span class="demonstration">日期查询</span>
        <el-date-picker @change="changeDate" v-model="curDate" type="date" placeholder="选择日期" :size="size"
          format="YYYY-MM-DD" value-format="YYYY-MM-DD" :clearable="false" />
        <el-button style="margin-left: 10px;" @click="getWeekDuty" type="primary">本周值勤</el-button>
      </p>
    </div>
    <div>
      <el-table class="web-table" :data="tableData" ref="tableRef" :span-method="spanMethod" border
        style="width: 100%;height: 100% ">
        <el-table-column v-for="value in columns" :key="value.prop" :prop="value.prop" :label="value.label"
          :width="value.width">
          <template #default="{ row }" v-if="value.soltName === 'deptName'">
            <div class="dept-name" @click="openDio(row)">{{ row.dept_name }}</div>
          </template>
          <template #default="{ row }" v-if="value.soltName === 'dutyTime'">
            <div v-if="row.start_time != row.end_time">{{ row.start_time }}<br /> ~ <br />{{ row.end_time }}</div>
            <div v-else>{{ row.start_time }}</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <div class="dia-con">
    <el-dialog v-model="dialogVisible">
      <div>
        <div class="dio-header">
          <p>
            <Discount style="width: 24px; height: 24px;margin: 18px 10px 10px 10px;" />
          </p>
          <p>
            <!-- {{ dioTitle }} -->
            人武部值班表
          </p>
        </div>
        <div class="dio-body">
          <el-table class="web-table" :data="tableDataLow" ref="tableRef" :span-method="spanMethod" border
            style="width: 100%;height: 100% ">
            <el-table-column v-for="value in columns" :key="value.prop" :prop="value.prop" :label="value.label"
              :width="value.width">
              <!-- <template #default="{ row }" v-if="value.soltName === 'deptName'">
                <div class="dept-name" @click="openDio(row)">{{ row.dept_name }}</div>
              </template> -->
              <template #default="{ row }" v-if="value.soltName === 'dutyTime'">
                <div v-if="row.start_time != row.end_time">{{ row.start_time }}<br /> ~ <br />{{ row.end_time }}</div>
                <div v-else>{{ row.start_time }}</div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>

</template>

<script setup>
import { ref, reactive, toRefs, onMounted } from 'vue'

import { useRouter, useRoute } from 'vue-router'
import { Discount, Message } from '@element-plus/icons-vue'

import { dutyList } from '@/api/duty/dutyman'


const router = useRouter()
const route = useRoute()
const allData = ref([])
//------------------- 弹窗 -------------------
const dialogVisible = ref(false)
const tableDataLow = ref([])
const openDio = (row) => {
 
  debugger
  console.log('点击了部门：', row.dept_name)
  allData.value.forEach((item) => {
    if (item.children.length) {
      item.children.forEach((value) => {
        Object.keys(value).forEach((val) => {
          if (val != 'children' && val == row.dept_name) {
            // const list = flattenDatalist([...value])
            // const flat = flattenData(list)
            if(value.children && value.children.length) {
               dialogVisible.value = true
               const list =  flattenData(value.children)
              const merged = mergeDutyByContinuousTime(list)
              tableDataLow.value = calcDeptRowSpan(merged)
            } else {
              Message.info('该部门没有值班人员')
            }
           
          }
        })
      })
    }
  })
}


//------------------- 日期查询 -------------------
const curDate = ref('')
//开始查询
const getList = (week) => {
  let params = {}
  if (week) {
    let { monday, sunday } = curWeek()
    params = {
      endDate: sunday,
      startDate: monday,
      subquery: true
    }
  } else {
    params = {
      endDate: curDate.value,
      startDate: curDate.value,
      subquery: true
    }
  }

  dutyList(params).then(res => {
    console.log('查询结果：', res)
    allData.value = res
    const list = flattenDatalist(res)
    // const flat = flattenData(list)
    const merged = mergeDutyByContinuousTime(list)
    tableData.value = calcDeptRowSpan(merged)
  })
}
//数据分解
function flattenDatalist(source) {
  let arr = []
  debugger
  source.map((item) => {
    item.children.forEach((value) => {
      Object.keys(value).forEach((val) => {
        if (val != 'children') {
          // value[val].children = value.children

          arr.push(...value[val])
        }
      })
    })
  })
  return arr
}
//数据扁平化
function flattenData(source) {
  return source.flatMap(item => {
    const deptName = Object.keys(item)[0]
    return item[deptName].map(row => ({
      ...row,
      dept_name: deptName
    }))
  })
}
//判断合并时间
function isContinuous(prevEnd, curStart) {
  const prev = new Date(prevEnd)
  const cur = new Date(curStart)

  // 允许：同一天 或 相差 1 天
  const diff =
    (cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

  return diff === 0 || diff === 1
}
//合并人员时间
function mergeDutyByContinuousTime(list) {
  const result = []
  const lastMap = new Map()

  list.forEach(item => {
    const key = `${item.person_id}_${item.seat_name}`
    const last = lastMap.get(key)

    if (
      last &&
      isContinuous(last._end, item.start_time)
    ) {
      // ✅ 连续（且是原始顺序下的连续）
      last._end =
        last._end > item.end_time ? last._end : item.end_time
      last._rowSpan++
    } else {
      // ❌ 不连续（或第一次）
      const row = {
        ...item,
        _start: item.start_time,
        _end: item.end_time,
        _rowSpan: 1,
        _isFirst: true
      }
      result.push(row)
      lastMap.set(key, row)
    }
  })

  // 补 duty_time
  result.forEach(row => {
    row.duty_time = `${row._start} ~ ${row._end}`
  })

  return result
}


// function mergeDutyData(list) {
//   const map = new Map()
//   const result = []

//   list.forEach(item => {
//     const key = `${item.person_id}_${item.seat_name}`

//     if (!map.has(key)) {
//       const row = {
//         ...item,
//         _rowSpan: 1,
//         _isFirst: true,
//         _start: item.start_time,
//         _end: item.end_time
//       }
//       map.set(key, row)
//       result.push(row)
//     } else {
//       const target = map.get(key)
//       target._rowSpan++
//       target._isFirst = true

//       target._start =
//         target._start < item.start_time ? target._start : item.start_time
//       target._end =
//         target._end > item.end_time ? target._end : item.end_time

//       // 👇 关键：后续行也要进表格，但标记为非首行
//       result.push({
//         ...item,
//         _isFirst: false,
//         _rowSpan: 0
//       })
//     }
//   })

//   // 给首行补 duty_time
//   result.forEach(row => {
//     if (row._isFirst) {
//       row.duty_time = `${row._start} ~ ${row._end}`
//     }
//   })

//   return result
// }
//计算部门合并行数

function calcDeptRowSpan(list) {
  let i = 0

  while (i < list.length) {
    const dept = list[i].dept_name
    let count = 1

    let j = i + 1
    while (j < list.length && list[j].dept_name === dept) {
      count++
      j++
    }

    // 第一行
    list[i]._deptRowSpan = count
    list[i]._deptFirst = true

    // 后续行
    for (let k = i + 1; k < i + count; k++) {
      list[k]._deptRowSpan = 0
      list[k]._deptFirst = false
    }

    i += count
  }

  return list
}



//合并规则
function spanMethod({ row, column }) {
  // ① 部门维度合并的列
  const DEPT_COLS = [
    'dept_name',
    'duty_team',
    'person_num',
    'leader',
    'contact_phone'
  ]

  if (DEPT_COLS.includes(column.property)) {
    const span = row._deptRowSpan

    if (span === 0) {
      return { rowspan: 0, colspan: 0 }
    }

    return {
      rowspan: span || 1,
      colspan: 1
    }
  }

  // ② 人 + 席位 + 时间维度
  const PERSON_COLS = [
    'seat_name',
    'person_name',
    'person_type',
    'duty',
    'seat_phone',
    'duty_time'
  ]

  if (PERSON_COLS.includes(column.property)) {
    const span = row._rowSpan

    if (span === 0) {
      return { rowspan: 0, colspan: 0 }
    }

    return {
      rowspan: span || 1,
      colspan: 1
    }
  }

  // ③ 其他列
  return { rowspan: 1, colspan: 1 }
}


// function spanMethod({ row, column }) {
//   // ① 部门列（第一列）
//   if (column.property === 'dept_name') {
//     return {
//       rowspan: row._deptRowSpan ?? 0,
//       colspan: row._deptRowSpan ? 1 : 0
//     }
//   }

//   // ② 人 + 席位相关列
//   const PERSON_COLS = [
//     'seat_name',
//     'person_name',
//     'person_type',
//     'duty',
//     'seat_phone',
//     'duty_time',
//     'duty_team',
//     'leader',
//     'contact_phone'
//   ]

//   if (PERSON_COLS.includes(column.property)) {
//     return {
//       rowspan: row._rowSpan ?? 0,
//       colspan: row._rowSpan ? 1 : 0
//     }
//   }

//   // ③ 其他列：永远不合并
//   return { rowspan: 1, colspan: 1 }
// }
// function spanMethod({ row, column }) {
//   // ① 部门列
//   if (column.property === 'dept_name') {
//     const span = row._deptRowSpan

//     if (span === 0) {
//       return { rowspan: 0, colspan: 0 }
//     }

//     return {
//       rowspan: span || 1,
//       colspan: 1
//     }
//   }

//   // ② 人 + 席位相关列
//   const PERSON_COLS = [
//     'seat_name',
//     'person_name',
//     'person_type',
//     'duty',
//     'seat_phone',
//     'duty_time',
//     'duty_team',
//     'leader',
//     'contact_phone'
//   ]

//   if (PERSON_COLS.includes(column.property)) {
//     const span = row._rowSpan

//     if (span === 0) {
//       return { rowspan: 0, colspan: 0 }
//     }

//     return {
//       rowspan: span || 1,
//       colspan: 1
//     }
//   }

//   // ③ 其他列
//   return { rowspan: 1, colspan: 1 }
// }



//获取周值班
const getWeekDuty = () => {
  getList(true)
}
//改变日期
const changeDate = (val) => {
  curDate.value = val
  getList(false)
}

//------------------- 表格数据 -------------------
const tableData = ref([])
const tableRef = ref(null)
const columns = [
  { prop: 'dept_name', label: '单位', width: 180, soltName: 'deptName' },
  { prop: 'seat_name', label: '席位名称' },
  { prop: 'person_name', label: '值班人员' },
  { prop: 'person_type', label: '类别' },
  { prop: 'duty', label: '职务' },
  { prop: 'seat_phone', label: '席位电话' },
  { prop: 'start_time', label: '值班时间', soltName: 'dutyTime' },
  { prop: 'duty_team', label: '值班分队' },
  { prop: 'person_num', label: '人数' },
  { prop: 'leader', label: '负责人' },
  { prop: 'contact_phone', label: '联系电话' },
]
// 合并单元格方法
const objectSpanMethod = ({ row, column, rowIndex, columnIndex, }) => {
  if (columnIndex === 0) {
    if (rowIndex % 2 === 0) {
      return {
        rowspan: 2,
        colspan: 1,
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0,
      }
    }
  }
}
//获取本周周一和周日数据
const curWeek = () => {
  var now = new Date()
  var nowTime = now.getTime()
  var day = now.getDay()

  // ✅ 关键修复：周日视为 7
  day = day === 0 ? 7 : day

  var oneDayTime = 24 * 60 * 60 * 1000

  // 周一
  var MondayTime = nowTime - (day - 1) * oneDayTime
  // 周日
  var SundayTime = nowTime + (7 - day) * oneDayTime

  function add0(m) {
    return m < 10 ? '0' + m : m
  }

  function format(time) {
    var d = new Date(time)
    return (
      d.getFullYear() +
      '-' +
      add0(d.getMonth() + 1) +
      '-' +
      add0(d.getDate())
    )
  }

  return {
    monday: format(MondayTime),
    sunday: format(SundayTime)
  }
}

//获取当日日期
const getNowFormatDate = () => {
  let date = new Date(),
    year = date.getFullYear(), //获取完整的年份(4位)
    month = date.getMonth() + 1, //获取当前月份(0-11,0代表1月)
    strDate = date.getDate() // 获取当前日(1-31)
  if (month < 10) month = `0${month}` // 如果月份是个位数，在前面补0
  if (strDate < 10) strDate = `0${strDate}` // 如果日是个位数，在前面补0

  return `${year}-${month}-${strDate}`
}
onMounted(() => {
  curDate.value = getNowFormatDate()
  getList()
})


</script>
<style scoped lang="scss">
.duty-con {
  min-width: 980px;
  width: 90%;
  margin: auto;
  height: 100%;
  box-sizing: border-box;
  min-height: 200px;
  // overflow-y: auto;
  overflow: hidden;
  position: relative;
  padding: 10px;

  // background-image: url('../../assets/images/avat_bg.png');
  // background-repeat: no-repeat;
  // background-size: 96vw 100vh;
  >div:nth-child(1) {
    // float: right;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: right;
    align-items: center;
    margin-bottom: 20px;

    >p:nth-child(1) {

      color: #E9F1FF;

      text-align: right;
      font-family: "PingFang SC";
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;

      /* 125% */
      span:nth-child(1) {

        margin-right: 14px;
      }

      :deep(.el-input__wrapper) {
        background: #091A69;
        box-shadow: 0 0 0 1px #354262 inset;

        .el-input__inner {
          color: #fff;
        }
      }
    }

    >p:nth-child(2) {
      width: 206px;
      height: 40px;
      background-image: url('@/assets/images/to_jupm.png');
      background-size: 100% 100%;
      background-repeat: no-repeat;
      cursor: pointer;

      color: #FFF;
      text-align: center;
      text-shadow: 2px 4px 4px rgba(0, 0, 0, 0.30);
      font-family: "Alibaba PuHuiTi 3.0";
      font-size: 20px;
      font-style: normal;
      font-weight: 600;
      line-height: 40px;
      letter-spacing: 1px;
    }
  }

  >div:nth-child(2) {
    height: calc(100% - 86px);
  }

}

.duty-bottom {
  :deep(.el-input__wrapper) {
    background: #091A69;
    box-shadow: 0 0 0 1px #354262 inset;
  }
}

.dept-name {
  cursor: pointer;

  &:hover {
    color: #409EFF;
  }
}

.dia-con {
  :deep(.el-dialog) {
    padding: 0px !important;
    width: 90vw;
    background: #00020c;
    position: relative;
    z-index: 999;
    margin-top: 8vh;
    // border: 1px solid #0E5BF6;

    .el-dialog__header {
      height: 0px;
      padding: 0;
    }

    .el-dialog__headerbtn {
      display: flex;
    }

    .el-dialog__close {
      width: 32px;
      height: 32px;
      margin-top: 4px;
      margin-left: 20px;
      background: url('@/assets/images/close.png');
      background-size: 28px 28px;
      background-repeat: no-repeat;

      >svg {
        display: none;
      }
    }

    .el-dialog__body {
      padding: 0px;
      margin: 0px;

    }

    .dio-header {
      height: 40px;
      background: url('@/assets/images/dio_header.png');
      background-size: 125% 40px;
      background-repeat: no-repeat;
      display: flex;
      justify-content: left;
      align-items: center;

      p {
        color: #C5E6FF;
        text-shadow: 1px 2px 3px #002164, 0px 0px 15px #3748FF;
        font-family: "Alibaba PuHuiTi 3.0";
        font-size: 22px;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 2.86px;
      }

    }

    .dio-body {
      // background: rgba(8, 14, 45, 0.90);
      padding: 20px 40px;
      box-sizing: border-box;
      background: #000B40;
      box-shadow: 0px 0px 15px 0px #0C52DF inset;
      // width: 100%;
      height: 80vh;
    }
  }
}
</style>
