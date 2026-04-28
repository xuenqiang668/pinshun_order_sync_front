<script setup lang="ts">
import { Fold, Expand, House, Tickets, Printer } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

const menuItems = [
  { index: '/dashboard', title: '仪表盘', icon: House },
  { index: '/tail-waybill-print', title: '揽收/尾程打印明细', icon: Tickets },
  { index: '/print-config', title: '面单打印配置', icon: Printer },
]

const pageTitle = computed(() => route.meta.title ?? '后台管理')

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <el-container class="h-screen">
    <el-aside
      :width="isCollapse ? '64px' : '210px'"
      class="bg-slate-900 transition-all duration-200"
    >
      <div
        class="h-14 flex items-center justify-center border-b border-slate-700 text-white font-semibold"
      >
        {{ isCollapse ? '后台' : '后台管理' }}
      </div>
      <el-menu
        :default-active="route.path"
        class="admin-menu border-none bg-slate-900"
        text-color="#cbd5e1"
        active-text-color="#ffffff"
        background-color="#0f172a"
        router
        :collapse="isCollapse"
      >
        <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="!h-14 bg-white border-b flex items-center justify-between px-4">
        <div class="flex items-center gap-3">
          <el-button link :icon="isCollapse ? Expand : Fold" @click="toggleCollapse" />
          <span class="text-base font-semibold text-slate-700">{{ pageTitle }}</span>
        </div>
        <div class="flex items-center gap-3">
          <el-tag type="success">{{ authStore.username }}</el-tag>
          <el-button type="danger" plain @click="logout">退出登录</el-button>
        </div>
      </el-header>

      <el-main class="bg-slate-100">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
:deep(.admin-menu .el-menu-item.is-active) {
  background-color: #2563eb;
  color: #ffffff;
}

:deep(.admin-menu .el-menu-item:hover) {
  background-color: #1e293b;
}
</style>
