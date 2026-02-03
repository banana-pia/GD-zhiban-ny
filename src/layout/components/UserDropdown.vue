<template>
  <div class="user-dropdown">
    <el-dropdown trigger="click" @command="handleCommand">
      <span class="el-dropdown-link">
        <el-avatar :size="32" class="avatar">
          {{ userName.slice(0, 1) }}
        </el-avatar>
        <span class="username">{{ userName }}</span>
        <el-icon class="arrow"><ArrowDown /></el-icon>
      </span>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="admin">
            进入后台管理
          </el-dropdown-item>
          <el-dropdown-item divided command="logout">
            退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 一般从 pinia / vuex / localStorage 里拿
const userName = '张三'

const handleCommand = (command) => {
  if (command === 'admin') {
    router.push('/system/user') // 后台管理路由
  }

  if (command === 'logout') {
    // 清除登录信息
    localStorage.clear()
    router.push('/login')
  }
}
</script>
<style scoped lang="scss">
.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

.avatar {
  background-color: #409eff;
  color: #fff;
}

.username {
  color: #8DC8FB;
  text-align: center;
  font-family: DS-Digital;
  font-size: 18px;
  font-weight: 700;
}

.arrow {
  font-size: 12px;
}
</style>
