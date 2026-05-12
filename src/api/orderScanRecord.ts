import type { CommonResult, PageResult } from '@/api/commonResult'
import { unwrapResult } from '@/api/commonResult'
import request from '@/utils/request'

export interface TemuOrderScanRecordParam {
  startTime?: string
  endTime?: string
  /** 扫描单价类型：1 扫描，2 入库 */
  priceType?: number
  current?: number
  size?: number
}

export interface ScanRecordStatResult {
  totalNum?: number
  totalPrice?: number
}

export interface TemuOrderScanRecordResult {
  id: string
  orderNo: string
  createTime: string
  createUserName: string
  priceType: number
  price: number
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

export const getOrderScanRecordStatApi = async (
  param: Pick<TemuOrderScanRecordParam, 'startTime' | 'endTime' | 'priceType'>,
) => {
  const { data } = await request.get<CommonResult<ScanRecordStatResult>>('/pinshun/order/scan/record/stat', {
    params: param,
  })
  return unwrapResult(data) ?? {}
}
