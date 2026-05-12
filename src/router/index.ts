import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import TailWaybillPrintView from '@/views/TailWaybillPrintView.vue'
import PrintConfigView from '@/views/PrintConfigView.vue'
import OrderScanRecordView from '@/views/OrderScanRecordView.vue'
import { useAuthStore } from '@/stores/auth'
import { APP_SHORT_NAME, APP_SYSTEM_NAME } from '@/config/app'

const isProd = import.meta.env.MODE !== 'development'

const router = createRouter({
  history: createWebHistory(isProd ? '/produce/' : '/'),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: '登录' },
    },
    {
      path: '/',
      component: AdminLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: { title: '首页' },
        },
        {
          path: 'tail-waybill-print',
          name: 'tail-waybill-print',
          component: TailWaybillPrintView,
          meta: { title: '揽收/尾程打印明细' },
        },
        {
          path: 'print-config',
          name: 'print-config',
          component: PrintConfigView,
          meta: { title: '面单打印配置' },
        },
        {
          path: 'order-scan-record',
          name: 'order-scan-record',
          component: OrderScanRecordView,
          meta: { title: '订单扫码记录' },
        },
      ],
    },
  ],
})

router.beforeEach(to => {
  const authStore = useAuthStore()
  if (to.path !== '/login' && !authStore.isAuthed) {
    return '/login'
  }
  if (to.path === '/login' && authStore.isAuthed) {
    return '/dashboard'
  }
  return true
})

router.afterEach(to => {
  document.title = `${to.meta.title ?? APP_SHORT_NAME} - ${APP_SYSTEM_NAME}`
})

export default router
