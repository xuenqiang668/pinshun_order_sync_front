import { Document, House, Printer, Tickets } from '@element-plus/icons-vue'
import type { Component } from 'vue'

export type AdminMenuItem = {
  index: string
  title: string
  icon: Component
}

/** 管理端侧栏菜单；后续在函数内 await 接口并 return 映射结果即可 */
export async function getAdminMenuItems(): Promise<AdminMenuItem[]> {
  return [
    { index: '/dashboard', title: '首页', icon: House },
    { index: '/tail-waybill-print', title: '揽收/尾程打印明细', icon: Tickets },
    { index: '/print-config', title: '面单打印配置', icon: Printer },
    { index: '/order-scan-record', title: '订单扫码记录', icon: Document },
  ]
}
