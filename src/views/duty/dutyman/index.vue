<!-- page-name: 值班人员,author: huzhi,date: 2024.9.15, description:,-->
<template>
  <div class="duty-con">
    <div>
      <p>
        <span class="demonstration">日期查询</span>
        <el-date-picker @change="changeDate" v-model="curDate" type="date" placeholder="选择日期" :size="size"
          format="YYYY-MM-DD" value-format="YYYY-MM-DD" :clearable="false" />
        <el-button style="margin-left: 10px;" @click="getWeekDuty" type="primary">本周执勤</el-button>
      </p>
    </div>
    <div>
      <el-table class="web-table" :data="tableData" ref="tableRef" :span-method="spanMethod" border
        style="width: 100%;height: 100% ">
        <el-table-column v-for="value in columns" :key="value.prop" :prop="value.prop" :label="value.label"
          :width="value.width">
          <template #default="{ row }" v-if="value.soltName === 'dutyTime'">
            <div v-if="row.start_time != row.end_time">{{ row.start_time }}<br /> ~ <br />{{ row.end_time }}</div>
            <div v-else>{{ row.start_time }}</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

</template>

<script setup>
import { ref, reactive, toRefs, onMounted } from 'vue'

import { useRouter, useRoute } from 'vue-router'

import { dutyList } from '@/api/duty/dutyman'


const router = useRouter()
const route = useRoute()

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
      subquery: false
    }
  } else {
    params = {
      endDate: curDate.value,
      startDate: curDate.value,
      subquery: false
    }
  }

  dutyList(params).then(res => {
    console.log('查询结果：', res)
    const flat = flattenData(res)
    const merged = mergeDutyData(flat)
    tableData.value = calcDeptRowSpan(merged)
  })
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
//合并人员时间
function mergeDutyData(list) {
  const map = new Map()
  const result = []

  list.forEach(item => {
    const key = `${item.person_id}_${item.seat_name}`

    if (!map.has(key)) {
      const row = {
        ...item,
        _rowSpan: 1,
        _isFirst: true,
        _start: item.start_time,
        _end: item.end_time
      }
      map.set(key, row)
      result.push(row)
    } else {
      const target = map.get(key)
      target._rowSpan++
      target._isFirst = true

      target._start =
        target._start < item.start_time ? target._start : item.start_time
      target._end =
        target._end > item.end_time ? target._end : item.end_time

      // 👇 关键：后续行也要进表格，但标记为非首行
      result.push({
        ...item,
        _isFirst: false,
        _rowSpan: 0
      })
    }
  })

  // 给首行补 duty_time
  result.forEach(row => {
    if (row._isFirst) {
      row.duty_time = `${row._start} ~ ${row._end}`
    }
  })

  return result
}
//计算部门合并行数
function calcDeptRowSpan(list) {
  let i = 0

  while (i < list.length) {
    let count = 1
    const currentDept = list[i].dept_name

    for (let j = i + 1; j < list.length; j++) {
      if (list[j].dept_name === currentDept) {
        count++
      } else {
        break
      }
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
  // ① 部门列：用部门的合并规则
  if (column.property === 'dept_name') {
    if (row._deptFirst) {
      return { rowspan: row._deptRowSpan, colspan: 1 }
    }
    return { rowspan: 0, colspan: 0 }
  }

  // ② 其他需要“人+席位”合并的列
  const PERSON_MERGE_COLS = [
    'seat_name',
    'person_name',
    'person_type',
    'duty',
    'seat_phone',
    'duty_time',
    'duty_team',
    'leader',
    'contact_phone'
  ]

  if (PERSON_MERGE_COLS.includes(column.property)) {
    if (row._isFirst) {
      return { rowspan: row._rowSpan, colspan: 1 }
    }
    return { rowspan: 0, colspan: 0 }
  }

  // ③ 其他列不合并
  return { rowspan: 1, colspan: 1 }
}


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
  { prop: 'dept_name', label: '单位', width: 180 },
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
  var now = new Date();
  var nowTime = now.getTime();
  var day = now.getDay();
  var oneDayTime = 24 * 60 * 60 * 1000;
  //显示周一
  var MondayTime = nowTime - (day - 1) * oneDayTime;
  //显示周日
  var SundayTime = nowTime + (7 - day) * oneDayTime;
  //初始化日期时间
  var monday = new Date(MondayTime);
  var sunday = new Date(SundayTime);

  function add0(m) { return m < 10 ? '0' + m : m }
  function format(shijianchuo) {
    //shijianchuo是整数，否则要parseInt转换
    var time = new Date(shijianchuo);
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    //var h = time.getHours();
    //var mm = time.getMinutes();
    //var s = time.getSeconds();
    return y + '-' + add0(m) + '-' + add0(d);
    //return y+''+add0(m)+''+add0(d)+''+add0(h)+':'+add0(mm)+':'+add0(s);
  }
  return {
    monday: format(monday),
    sunday: format(sunday)
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
</style>
