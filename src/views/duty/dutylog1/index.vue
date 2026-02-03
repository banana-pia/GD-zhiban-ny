<!-- page-name: 值班简报,author: ,date: , description:,-->
<template>
  <div class="tick-con">
    <div class="tick-left">
      <ShowPdf :iframeUrl="iframeUrl" :name="fileName" />
    </div>
    <div class="tick-right">
      <div class="tick-right-title">
        <p><span></span><span>数据列表</span></p>
        <p>
          <span class="demonstration">日期查询</span>
          <el-date-picker v-model="curDate" type="month" placeholder="选择日期" :size="size" format="YYYY-MM"
            @change = "changeTime"
            value-format="YYYY-MM"  />
        </p>
      </div>
      <div class="tick-right-con">
        <div :class="{'curTab':curTab == index}" v-for="(item,index) in rightList">
          <p></p>
          <div>
            <p @click="changePdf(item.attaches[0].fileId,index,item.attaches[0].fileName)">{{ item.bt }}</p>
            <p>{{ item.zbrq }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted } from 'vue'
import { queryJb, attch } from '@/axios/duty.js'
import ShowPdf from '../../../components/showpdf.vue'

onMounted(()=>{
  getCurTime()
  getList()
})

// <!-- 日期查询 -->
const curDate = ref('')
// 今日日期
const getCurTime = () => {
  const now = new Date();
  // 获取年份
  const year = now.getFullYear();
  // 获取月份（注意：月份是从0开始的，1月是0，12月是11）
  const month = String(now.getMonth() + 1).padStart(2, '0');
  // 获取日期
  const day = String(now.getDate()).padStart(2, '0');
  // 获取小时
  const hours = String(now.getHours()).padStart(2, '0');
  // 获取分钟
  const minutes = String(now.getMinutes()).padStart(2, '0');
  // 获取秒数
  const seconds = String(now.getSeconds()).padStart(2, '0');
  // 输出格式化后的年月日时分秒
  let dayTimeDefault = `${year}-${month}-${day}`
  let fenTimeDefault = `${hours}:${minutes}:${seconds}`
  console.log(`当前时间是：${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
  curDate.value = `${year}-${month}`
}
const changeTime = () => {
  getList()
}
const clearTime = () => {
  getCurTime()
  getList()
}
const getHashParam = (param) => {
  var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg); //匹配目标参数
  if (r != null) {
    return decodeURIComponent(r[2]);
    //这里为什么是从第三个字符解析呢？不知道这样理解对不对，因为路径后面的参数形式为参数名=参数值，而第一个字符为参数名，第二个为=，第三个就为参数值了。。。因为下面调用的时候得出的就是参数值
  }
  return null;//返回参数值

}

// <!-- 右侧列表数据 -->
const curTab = ref(0)
const iframeUrl = ref('')
const fileName = ref('')
const rightList = ref([
  {
    date: '2025-03-12 12:00:00',
    label: "这该死的数据塞进这该死的页面"
  },
  {
    date: '2025-03-12 12:00:00',
    label: "这该死的数据塞进这该死的页面"
  },
  {
    date: '2025-03-12 12:00:00',
    label: "这该死的数据塞进这该死的页面"
  }
])
//获取列表数据
const getList = () => {
  let obj = {
    date:curDate.value,
    danwei:'',
    xzqName: getHashParam('name')
  }
  queryJb(obj).then((res) => {
    rightList.value = res
    curTab.value = 0
    // iframeUrl.value = res.length || res[0].attaches.fileId
    dbSelected(res.length && res[0].attaches[0].fileId,res.length && res[0].attaches[0].fileName)
  })
}
const changePdf = (val,index,name) => {
  curTab.value = index
  dbSelected(val,name)

}
const dbSelected = (val,name) => {
  fileName.value = name
  attch({ fileId: val }).then((res) => {
    iframeUrl.value = res
  }).catch((err)=>{
    iframeUrl.value = 0
  })

}



</script>
<style scoped lang="scss">
.tick-con {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  padding: 20px;
  display: flex;
}

.tick-left {
  // flex: 1;
  width: calc(100% - 558px);
  box-sizing: border-box;
  overflow: hidden;

}

.tick-right {
  width: 568px;
  flex-shrink: 0;
  height: 100%;
  margin-left: 20px;

  .tick-right-title {
    width: 568px;
    height: 57px;
    padding: 7px 14px;
    box-sizing: border-box;
    background: linear-gradient(0deg, rgba(8, 24, 103, 0.00) 0%, #091A69 100%), linear-gradient(270deg, rgba(13, 88, 238, 0.00) 0%, rgba(13, 88, 238, 0.20) 100%);
    display: flex;
    justify-content: space-between;
    align-items: center;

    >p:nth-child(1) {
      display: flex;
      justify-content: left;
      align-items: center;

      span:nth-child(1) {
        display: inline-block;
        width: 24px;
        height: 24px;
        background: url("@/assets/images/dutyman_title_icon.png");
        background-size: 100% 100%;
        margin-right: 14px;
      }

      span:nth-child(2) {
        color: #C5E6FF;
        text-shadow: 1px 2px 3px #002164, 0px 0px 15px #3748FF;
        font-family: "Alibaba PuHuiTi 3.0";
        font-size: 22px;
        font-style: normal;
        font-weight: 700;

        letter-spacing: 2.86px;
      }
    }

    >p:nth-child(2) {
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
  }

  .tick-right-con {
    height: calc(100% - 57px);
    overflow-y: auto;

    >div {
     
      display: flex;
      justify-content: left;
      align-items: center;
      padding: 10px 30px;
      border: 1px solid #091a69;
      background: linear-gradient(180deg, rgba(149, 156, 169, 0.00) 30%, rgba(160, 172, 195, 0.21) 100%);
      

      >p {
        width: 80px;
        height: 80px;
        flex-shrink: 0;
        background: url('@/assets/images/pdf_icon.png');
        background-size: 400% 400%;
        background-position: center;
        margin-right: 20px;
      }

      >div {
        p:nth-child(1) {
          text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          font-family: "Alibaba PuHuiTi 3.0";
          font-size: 18px;
          font-style: normal;
          font-weight: 700;
          line-height: normal;
          margin-bottom: 10px;

          background: linear-gradient(180deg, #FFF 33.5%, #84BFFF 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;

          cursor: pointer;
        }

        p:nth-child(2) {
          color: #ADBBDC;
          text-shadow: 2px 4px 4px rgba(0, 0, 0, 0.30);
          font-family: "Alibaba PuHuiTi 3.0";
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }
      }
      &:hover{
        // border: 1px solid #08F;
      background: linear-gradient(180deg, rgba(22, 70, 163, 0.00) 18.5%, rgba(21, 80, 196, 0.56) 100%);

      }
    }
    .curTab{
      background: linear-gradient(180deg, rgba(22, 70, 163, 0.00) 18.5%, rgba(21, 80, 196, 0.56) 100%);

    }
  }
}
</style>