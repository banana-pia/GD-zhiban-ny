<!-- page-name: 兵力情况,author: ,date: , description:,-->
<template>
  <div class="strength-page">
    <div class="strength-left">
      <div :class="{ 'duty-Mili': true, curTab: curTab == 1 }">
        <div></div>
        <div>
          <div @click="changeTab(1)">值班兵力</div>
          <div>
            <!-- 军分区各级共 0 人负责值班任务 -->
            {{ descBl }}
          </div>
        </div>
      </div>
      <div :class="{ 'sport-Mili': true, curTab: curTab == 2 }">
        <div></div>
        <div>
          <div @click="changeTab(2)">行动兵力</div>
          <div>
            {{ strebl }}
          </div>
        </div>
      </div>
    </div>
    <div class="strength-right">
      <div>
        <!-- <p></p> -->
        <div class="strength-title">

          <div>兵力统计</div>
          <div>
            <el-date-picker v-model="dayParams" value-format="YYYY-MM-DD" @change="changeData" type="day"
              placeholder="选择日期" />
          </div>
        </div>
      </div>
      <div ref="chartRef" id="echarts-military"></div>
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
            行动兵力情况
          </p>
        </div>
        <div class="dio-body">
          <!-- :span-method="spanMethod" -->
          <el-table class="web-table harder-border" :data="tableData" border  style="width: 100%">
            <!-- 基础信息 -->
            <el-table-column type="index" width="50" label="序号" />
            <el-table-column prop="month" label="月份" />

            <!-- 任务来源 -->
            <el-table-column label="任务来源">
              <el-table-column prop="taskName" label="任务名称" />
              <el-table-column prop="taskSource" label="任务来源" />
              <el-table-column prop="demandUnitDivision" label="需求单位" />
            </el-table-column>

            <!-- 基本情况 -->
            <el-table-column label="基本情况">
              <el-table-column prop="taskType" label="任务类型" />
              <el-table-column prop="taskTimeRange" label="执行时间" width="130">
                <template #default="{ row }">
                  <div v-if="row.taskTimeStart != row.taskTimeEnd">{{ row.taskTimeStart }}<br /> ~ <br />{{ row.taskTimeEnd }}</div>
                  <div v-else>{{ row.taskTimeStart }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="days" label="天数" />
              <el-table-column prop="participantCount" label="执行人数" />
              <el-table-column prop="personDays" label="人/天数" />
              <el-table-column prop="specificTask" label="民兵担任的具体任务" />
            </el-table-column>

            <!-- 审核报批 -->
            <el-table-column label="审核报批">
              <el-table-column prop="approveUnit" label="批准单位" />
              <el-table-column prop="approveFileName" label="批准用兵文件" />
              <el-table-column prop="fileNumber" label="发文字号" />
            </el-table-column>

            <!-- 现场指挥 -->
            <el-table-column label="现场指挥">
              <el-table-column prop="commandUnit" label="指挥单位" />
              <el-table-column prop="commanderInfo" label="指挥人员，电话" />
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
// -------------------- 依赖引入 --------------------
import { ref, reactive, toRefs, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { dutyStatistics, dutyStatDesc, soldierStatDesc, soldierStatList, previewSoldierStat } from '@/api/duty/dutyman'

//--------------------弹窗--------------------------
const tableDataLow = ref([{
    taskId: 1,
    index: 1,
    month: '1月',
    task_name: '2025年元旦升旗安保',
    task_source: '区政府',
    request_unit: '东城区人武部',
    task_type: '协助安保',
    task_time: '2024-12-31 ~ 2025-01-01',
    days: 1,
    people: '民兵150人',
    soldier_count: 150,
    service_type: '安保勤务',
    approve_unit: '东城区政府',
    approve_leader: '张三',
    approve_time: '2024-12-20',
    commander: '李四',
    contact: '138****0001'
  },
  {
    taskId: 1,
    index: 1,
    month: '1月',
    task_name: '2025年元旦升旗安保',
    task_source: '区政府',
    request_unit: '东城区人武部',
    task_type: '协助安保',
    task_time: '2024-12-31 ~ 2025-01-01',
    days: 1,
    people: '民兵150人',
    soldier_count: 150,
    service_type: '安保勤务',
    approve_unit: '东城区政府',
    approve_leader: '张三',
    approve_time: '2024-12-20',
    commander: '王五',
    contact: '138****0002'
  }])
const dialogVisible = ref(false)
function buildRowSpan(data) {
  const map = new Map()
  const result = data.map(item => ({ ...item, _rowSpan: {} }))

  data.forEach((item, index) => {
    const key = item.taskId
    if (!map.has(key)) {
      map.set(key, { index, count: 1 })
    } else {
      map.get(key).count++
    }
  })

  map.forEach(({ index, count }) => {
    result[index]._rowSpan.main = count
    for (let i = index + 1; i < index + count; i++) {
      result[i]._rowSpan.main = 0
    }
  })

  return result
}

const tableData = ref([])
//获取值班兵力列表
const getSoldierStatList = (deptName) => {
  soldierStatList({ data: monthParams.value,pageNum:1,pageSize:'1000',deptName }).then(res => {
    dialogVisible.value = true
    tableData.value = res.list
  })
}

/**
 * 合并规则
 */
function spanMethod({ row, column }) {
  const mergeCols = [
    'index',
    'month',
    'task_name',
    'task_source',
    'request_unit',
    'task_type',
    'task_time',
    'days',
    'people',
    'soldier_count',
    'service_type',
    'approve_unit',
    'approve_leader',
    'approve_time'
  ]

  if (mergeCols.includes(column.property)) {
    const rowspan = row._rowSpan.main
    return {
      rowspan,
      colspan: rowspan ? 1 : 0
    }
  }
}

// -------------------- 图表配置 --------------------
const chartRef = ref(null)
let chartInstance = null
const monthParams = ref('')
const dayParams = ref('')
const descBl = ref('') //兵力统计描述
const strebl = ref('') //行动兵力描述

const curTab = ref(1)
const option = {
  // backgroundColor: '#050f3a',
  // title: {
  //   text: '兵力统计',
  //   left: 20,
  //   top: 20,
  //   textStyle: { color: '#fff', fontSize: 18 }
  // },
  grid: {
    left: 100,
    right: 40,
    top: 40,
    bottom: 100
  },
  xAxis: {
    type: 'category',
    axisLabel: {
      color: '#ffffff',
      fontSize: 20,
      fontWeight: 'bold',
      rotate: 30   // ✅ X 轴字体倾斜 45°
    },
    axisLine: {
      lineStyle: {
        color: '#ffffff'
      }
    },
    axisTick: {
      lineStyle: {
        color: '#ffffff'
      }
    },
    data: [],
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#00c8ff',
      fontSize: 20
    },
    axisLine: {
      show: true,          // ✅ 保留 Y 轴线
      lineStyle: {
        color: '#ffffff'
      }
    },
    axisTick: {
      show: true
    },
    splitLine: {
      show: false          // ❌ 不要背景横线刻度
    },
    // min: 0,
    // max: 1
  },
  series: [
    {
      type: 'bar',
      barWidth: 16,
      data: [],
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#1a9bff' },
          { offset: 1, color: '#4fd2ff' }
        ])
      }
    }
  ]
}
//<------------获取值班兵力和行动兵力数据------------>
const getData = () => {
  if (curTab.value == 1) {
    dutyStatistics({ data: dayParams.value }).then(res => {
      console.log('兵力统计数据：', res)
      let xAxisDataNew = []
      let echartsDataNew = []
      if (res.length) {
        res[0].children?.forEach((item, index) => {
          // item.forEach((child, childIndex) => {

          Object.keys(item).forEach((key) => {
            if (key !== 'children') {
              xAxisDataNew.push(key)
              echartsDataNew.push(item[key])
            }
          })
          // })
        })
      }
      option.xAxis.data = xAxisDataNew
      option.series[0].data = echartsDataNew
      if (chartInstance) {
        chartInstance.setOption(option)
      }
      //     chartInstance.setOption(option)
      //   }
      // }
    })
  }
  if (curTab.value == 2) {
    previewSoldierStat({ data: monthParams.value }).then((res)=>{
      console.log('兵力统计数据：', res)
      let xAxisDataNew = []
      let echartsDataNew = []
      if (res.length) {
        res[0].children?.forEach((item, index) => {
          // item.forEach((child, childIndex) => {

          Object.keys(item).forEach((key) => {
            if (key !== 'children') {
              xAxisDataNew.push(key)
              echartsDataNew.push(item[key])
            }
          })
          // })
        })
      }
      option.xAxis.data = xAxisDataNew
      option.series[0].data = echartsDataNew
      if (chartInstance) {
        chartInstance.setOption(option)
      }
    })
  }

}
//<------------获取值班兵力描述------------>
const getDutyStatDesc = () => {
  dutyStatDesc({ startDate: dayParams.value ,endDate: dayParams.value}).then(res => {
    console.log('值班兵力描述：', res)
    descBl.value = res
  })
}
//<------------获取行动兵力描述------------>
const getZdysx = () => {
  soldierStatDesc({ startDate: dayParams.value ,endDate: dayParams.value}).then(res => {
    console.log('行动兵力描述：', res)
    strebl.value = res
  })
}
//<------------切换tab------------>
const changeTab = (tab) => {
  curTab.value = tab
  getData()
}
//<------------切换当前日------------>
const changeData = () => {
  getData()
  getDutyStatDesc()
}
//<------------获取当前月------------>
const getCurrentMonth = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
//获取当前日
const getNowFormatDate = () => {
  let date = new Date(),
    year = date.getFullYear(), //获取完整的年份(4位)
    month = date.getMonth() + 1, //获取当前月份(0-11,0代表1月)
    strDate = date.getDate() // 获取当前日(1-31)
  if (month < 10) month = `0${month}` // 如果月份是个位数，在前面补0
  if (strDate < 10) strDate = `0${strDate}` // 如果日是个位数，在前面补0

  return `${year}-${month}-${strDate}`
}
//<------------echarts自适应------------>
window.addEventListener('resize', () => {
  if (chartInstance) {
    resizeChart()
  }
})
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// -------------------- 生命周期 --------------------

onMounted(() => {
  nextTick(async () => {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(option)
    chartInstance.on('click', function (params) {
      if(curTab.value == 2) {
        debugger
       getSoldierStatList(params.name) 

      }
    });
    await getData()

  })

  monthParams.value = getCurrentMonth()
  dayParams.value = getNowFormatDate()
  getDutyStatDesc()
  getZdysx()
})

// 页面销毁时释放
onBeforeUnmount(() => {
  chartInstance && chartInstance.dispose()
  window.removeEventListener('resize', resizeChart)

})
</script>
<style scoped lang="scss">
.strength-page {
  display: flex;
  height: 100%;
  min-width: 800px;
  width: 80%;
  margin: 0 auto;
}

.strength-left {
  width: 560px;
  flex-shrink: 0;
  margin-right: 60px;
}

.strength-right {
  flex: 1;

  >div:nth-child(1) {
    p {
      color: #f0f8ff;
      flex-direction: column;
      font-family: "Alibaba PuHuiTi 3.0";
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
      margin-bottom: 10px;
    }
  }
}

.curTab {
  >div:nth-child(2) {
    >div:nth-child(1) {
      transform: scale(1.1);
      background: linear-gradient(180deg, #e4b92c 16.5%, #ffa228);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
    }
  }

}

.duty-Mili {

  display: flex;
  justify-content: left;
  background-image: url('@/assets/images/bottom-bl.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  // margin-bottom: 40px;
  padding: 20px;
  margin-top: 7vh;

  >div:nth-child(1) {
    width: 160px;
    height: 140px;
    background-image: url('@/assets/images/duty-bl.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  >div:nth-child(2) {
    >div:nth-child(1) {
      cursor: pointer;
      font-family: Alibaba PuHuiTi 3;
      font-weight: 700;
      font-style: Bold;
      font-size: 24px;
      line-height: 100%;
      letter-spacing: 5%;
      background: linear-gradient(180deg, #fff 16.5%, #ffa228);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
      margin-bottom: 20px;
    }

    >div:nth-child(2) {
      // padding: 5% 5% 8%;
      // width: 40%;
      // height: 90%;
      display: flex;
      color: #f0f8ff;
      flex-direction: column;
      font-family: "Alibaba PuHuiTi 3.0";
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
    }
  }
}

.sport-Mili {
  display: flex;
  justify-content: left;
  background-image: url('@/assets/images/bottom-bl.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  padding: 20px;
  margin-top: 100px;

  >div:nth-child(1) {
    width: 160px;
    height: 140px;
    background-image: url('@/assets/images/operation-bl.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  >div:nth-child(2) {
    >div:nth-child(1) {
      cursor: pointer;
      font-family: Alibaba PuHuiTi 3;
      font-weight: 700;
      font-style: Bold;
      font-size: 24px;
      line-height: 100%;
      letter-spacing: 5%;
      background: linear-gradient(180deg, #fff 16.5%, #ffa228);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
      margin-bottom: 20px;
    }

    >div:nth-child(2) {
      // padding: 5% 5% 8%;
      // width: 40%;
      // height: 90%;
      display: flex;
      color: #f0f8ff;
      flex-direction: column;
      font-family: "Alibaba PuHuiTi 3.0";
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
    }
  }
}

.strength-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-image: url('@/assets/images/bl_title.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 100%;
  height: 40px;

  >div:nth-child(1) {
    font-family: Alibaba PuHuiTi 3;
    font-weight: 700;
    font-style: Bold;
    font-size: 24px;
    line-height: 100%;
    letter-spacing: 5%;
    margin-left: 40px;
    color: #fff;
  }

  >div:nth-child(2) {
    // width: 200px;
  }
}

#echarts-military {
  width: 100%;
  height: calc(100% - 120px);
  /* ❗ 没高度 = 一定不显示 */
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