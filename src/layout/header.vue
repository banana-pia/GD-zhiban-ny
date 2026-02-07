<!-- page-name: 头部导航栏,author: ,date: , description:,-->
<template>
  <div class="gj-con">
    <div class="menu-page">
      <div
        :class="{ 'blue': (title == '国防动员领导管理系统') || (title == '系统管理') || (title.includes('区') || title == '值班工作态势' || title == '要事提醒' || title == '知识库'), 'top-menu': true }">
        <div></div>
        <div>
          <div>{{ curTime }}</div>
          <div>{{ title }}</div>
          <div>
            <!-- <p class="">国防动员领导管理系统</p> -->
            <UserDropdown />
          </div>
        </div>
        <div></div>
      </div>
      <div class="base-page blue">
        <div class="duty-top no-copy">
          <div :class="{ 'cur-btn': curBtn == item.value }" @click="changBtn(item)" v-for="item in menuList">
            {{ item.label }}</div>
        </div>
        <div class="duty-bottom">    
               <router-view></router-view>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import UserDropdown from './components/UserDropdown.vue'
const router = useRouter()
const route = useRoute()

// const title = ref('国防动员领导管理系统-值班工作态势')
const title = ref('值班工作态势')

const curTime = ref('')
let timeCpt = null  //计时器
const menuList = ref([])
//<!-- 值班工作态势菜单模块 -->
const sheng = [
  {label:'省军区值班信息',value:'1',route:'/dutyMan'},
  {label:'军分区值班信息',value:'6',route:'/information'},

  {label:'兵力情况',value:'2',route:'/militaryStrength'},
  // {label:'省军区首长活动',value:'3'},
  // {label:'本周主要工作',value:'4'},
  // {label:'应急突发情况处置',value:'5'},
  {label:'值班简报',value:'7',route:'/dutylog'},

]
const shi = [
  {label:'值班信息',value:'1',route:'/dutyMan'},
  {label:'人武部值班信息',value:'6',route:'/information'},
  {label:'兵力情况',value:'2',route:'/militaryStrength'},
  // {label:'首长活动',value:'3'},
  // {label:'本周主要工作',value:'4'},
  // {label:'应急突发情况处置',value:'5'},
  {label:'值班简报',value:'7',route:'/dutylog'},

]

//<-- 获取当前时间 -->
function getCurTime() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  curTime.value = `${y}年${m}月${d}日  ${h}:${mi}:${s}`
}

//<-- 切换菜单按钮 -->
const curBtn = ref('1')
const changBtn = (item) => {
  curBtn.value = item.value
  router.push(item.route)
  // switch (item.value) {
  //   case '1':
  //     // title.value = (menuList.value == sheng) ? '省军区值班人员' : '值班人员'
      
  //     break
  //   case '2':
  //     // title.value = '兵力情况'
  //     break
  //   // case '3':
  //   //   title.value = (menuList.value == sheng) ? '省军区首长活动' : '首长活动'
  //   //   break
  //   // case '4':
  //   //   title.value = (menuList.value == sheng) ? '本周主要工作' : '本周主要工作'
  //   //   break
  //   // case '5':
  //   //   title.value = (menuList.value == sheng) ? '应急突发情况处置' : '应急突发情况处置'
  //   //   break
  //   case '6':
  //     // title.value = (menuList.value == sheng) ? '军分区值班信息' : '人武部值班信息'
  //     break
  //   case '7':
  //     // title.value = '值班简报'
  //     router.push(item.route)
  //     break
  //   default:
  //     // title.value = '值班工作态势'
  // }
}

onMounted(() => {
  timeCpt = setInterval(getCurTime, 1000)
  menuList.value = sheng  //默认省军区菜单
})

onBeforeUnmount(() => {
  clearInterval(timeCpt)
  // window.removeEventListener('message', watchMap)
  timeCpt = null
})
watch(
  () => route.path,
  (val) => {
    sheng.find((item) => {
      if (item.route && val.includes(item.route)) {
        curBtn.value = item.value
      }
    })
  },
  { immediate: true }
)
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.menu-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  // background: radial-gradient(37.3% 47.75% at 53.7% 52.4%, rgba(13, 40, 173, 0.00) 31%, #000B40 100%);
}

.top-menu {
  width: 100vw;
  height: 80px;
  overflow: hidden;
  background-color: #000b40;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 10;

  >div:nth-child(1) {
    background-color: rgba(61, 127, 255, 0.18);
    flex: 1;
    height: 72px;
  }

  >div:nth-child(3) {
    flex: 1;
  }

  >div:nth-child(2) {
    // width: 2456px;
    width: 1930px;
    height: 80px;
    background: url('@/assets/images/nav_bg4.png') no-repeat;
    background-size: 2456px 80px;
    background-position: center;
    display: flex;
    justify-content: center;

    >div:nth-child(2) {
      line-height: 64px;
      text-align: center;
      // text-shadow: 0px 3px 4px rgba(0, 0, 0, 0.25), 0px 0px 20px #0090FF;
      font-family: "Alibaba PuHuiTi 3.0";
      font-size: 42px;
      font-style: normal;
      font-weight: 800;
      letter-spacing: 3.8px;
      background: linear-gradient(0deg, #95DCFF 0%, #F7FFFF 64.5%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    >div:nth-child(1) {
      position: absolute;
      left: 20px;
      top: 12px;
      color: #8DC8FB;
      text-align: center;
      font-family: DS-Digital;
      font-size: 18px;
      font-weight: 700;
    }

    >div:nth-child(3) {
      position: absolute;
      right: 20px;
      top: 12px;
    }

  }



}
.duty-top{
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 1500px;
  padding-top: 20px;
  >div {
    padding: 20px;
    width: 168px;
    height: 48px;
    line-height: 48px;
    background-image: url('@/assets/images/btn_dark.png');
    background-size: 230px 48px;
    background-repeat: no-repeat;
    background-position: center;
    color: #B3D9FF;
    box-sizing: content-box;
    text-align: center;
    font-family: "Alibaba PuHuiTi 3.0";
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 48px;
    cursor: pointer;

    &:hover {
      background-image: url('@/assets/images/btn_light.png');
      color: #FFF;

      text-align: center;
      text-shadow: 0px 4px 4px #001889;
      font-family: "Alibaba PuHuiTi 3.0";

    }
  }

  >div.cur-btn {
    background-image: url('@/assets/images/btn_light.png');
    color: #FFF;

    text-align: center;
    text-shadow: 0px 4px 4px #001889;
    font-family: "Alibaba PuHuiTi 3.0";
  }
}
.duty-bottom{
  height: calc(100% - 88px);
  padding:  20px;
  box-sizing: border-box;
  overflow: hidden;
  >div{
    max-width: 1700px;
    
    margin: 0 auto;
  }
 
}

.blue {
  background-color: #000b40 !important;
}

.base-page {
  width: 100vw;
  height: calc(100vh - 80px);
}
</style>