import type { CommonResult, PageResult } from '@/api/commonResult'
import { unwrapResult } from '@/api/commonResult'
import request from '@/utils/request'

export interface TemuOrderScanRecordParam {
  startTime?: string
  endTime?: string
  current?: number
  size?: number
}

export interface TemuOrderScanRecordResult {
  id: string
  orderNo: string
  createTime: string
  createUserName: string
}

export const getOrderScanRecordPageApi = async (param: TemuOrderScanRecordParam) => {
  const { data } = await request.get<CommonResult<PageResult<TemuOrderScanRecordResult>>>(
    '/pinshun/order/scan/record/page',
    { params: param },
  )
  const pageData = unwrapResult(data)
  return {
    records: pageData?.records ?? pageData?.list ?? [],
    total: pageData?.total ?? 0,
  }
}
