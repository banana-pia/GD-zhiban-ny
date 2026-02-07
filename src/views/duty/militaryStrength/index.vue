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
            全区值班人员现役X人、文职Xx人、民兵XX人。
          </div>
        </div>
      </div>
      <div :class="{ 'sport-Mili': true, curTab: curTab == 2 }">
        <div></div>
        <div>
          <div @click="changeTab(2)">行动兵力</div>
          <div>
            全区各级共动用兵力 0 人
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
            <el-date-picker v-model="monthParams" value-format="YYYY-MM" @change="changeData" type="month" placeholder="选择月份" />
          </div>
        </div>
      </div>
      <div ref="chartRef" id="echarts-military"></div>
    </div>
  </div>
</template>

<script setup>
// -------------------- 依赖引入 --------------------
import { ref, reactive, toRefs, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { dutyStatistics } from '@/api/duty/dutyman'


// -------------------- 图表配置 --------------------
const chartRef = ref(null)
let chartInstance = null
const monthParams = ref('')
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
    left: 60,
    right: 40,
    top: 40,
    bottom: 80
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
    data: ['南昌警备区', '赣州军分区', '吉安军分区', '九江军分区', '上饶军分区', '抚州军分区', '宜春军分区','萍乡军分区','景德镇军分区','鹰潭军分区','新余军分区']
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
    min: 0,
    max: 1
  },
  series: [
    {
      type: 'bar',
      barWidth: 16,
      data: [0.32, 0.45, 0.28, 0.36, 0.52, 0.41, 0.63,0.56,0.67,0.76,0.67],
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
    dutyStatistics({ statDate: monthParams.value }).then(res => {
      console.log('兵力统计数据：', res)
      // 假设接口返回的数据格式为 { labels: [...], values: [...] }
      if (res && res.labels && res.values) {
        option.xAxis.data = res.labels
        option.series[0].data = res.values
        if (chartInstance) {
          chartInstance.setOption(option)
        }
      }
    })
  }

}
//<------------切换tab------------>
const changeTab = (tab) => {
  curTab.value = tab
  getData()
}
//<------------切换当前月------------>
const changeData = () => {
  getData()
}
//<------------获取当前月------------>
const getCurrentMonth = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
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
    await getData()
    
  })

  monthParams.value = getCurrentMonth()
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
  margin-bottom: 40px;
  padding: 20px;
  margin-top: 100px;

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
</style>