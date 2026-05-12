<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'
import { APP_SHORT_NAME } from '@/config/app'
import { getAdminMenuItems, type AdminMenuItem } from '@/layouts/adminMenu'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

const menuItems = ref<AdminMenuItem[]>([])

onMounted(async () => {
  menuItems.value = await getAdminMenuItems()
})

const pageTitle = computed(() => route.meta.title ?? APP_SHORT_NAME)

const userInitial = computed(() => {
  const name = authStore.username?.trim()
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
})

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
    <el-aside :width="isCollapse ? '64px' : '210px'" class="bg-slate-900 transition-all duration-200">
      <div class="h-14 flex items-center justify-center border-b border-slate-700 text-white font-semibold">
        {{ isCollapse ? '后台' : APP_SHORT_NAME }}
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
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header !h-[52px] !px-4 sm:!px-5">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <el-tooltip content="展开 / 收起侧栏" placement="bottom">
            <el-button :icon="isCollapse ? Expand : Fold" circle class="header-collapse-btn" @click="toggleCollapse" />
          </el-tooltip>
          <span class="hidden h-5 w-px shrink-0 bg-slate-200 sm:block" aria-hidden="true" />
          <h1 class="min-w-0 truncate text-[15px] font-semibold leading-tight tracking-tight text-slate-800">
            {{ pageTitle }}
          </h1>
        </div>
        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            class="user-badge flex max-w-[min(100vw-12rem,14rem)] items-center gap-2 rounded-full border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 py-1 pl-1 pr-2.5 shadow-sm sm:pr-3"
          >
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-900 text-[11px] font-bold text-white shadow-inner ring-1 ring-white/20"
              aria-hidden="true"
            >
              {{ userInitial }}
            </span>
            <span class="hidden truncate text-xs font-medium text-slate-600 sm:inline">{{ authStore.username }}</span>
          </div>
          <el-button type="danger" plain size="small" round class="logout-btn !font-medium" @click="logout">
            退出登录
          </el-button>
        </div>
      </el-header>

      <el-main class="bg-slate-100">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgb(226 232 240 / 0.95);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.8) inset,
    0 4px 14px rgb(15 23 42 / 0.05);
}

.header-collapse-btn {
  flex-shrink: 0;
  --el-button-bg-color: #f8fafc;
  --el-button-border-color: #e2e8f0;
  --el-button-text-color: #475569;
  --el-button-hover-bg-color: #eff6ff;
  --el-button-hover-border-color: #bfdbfe;
  --el-button-hover-text-color: #1d4ed8;
}

.logout-btn {
  --el-button-bg-color: transparent;
}

:deep(.admin-menu .el-menu-item.is-active) {
  background-color: #2563eb;
  color: #ffffff;
}

:deep(.admin-menu .el-menu-item:hover) {
  background-color: #1e293b;
}
</style>
