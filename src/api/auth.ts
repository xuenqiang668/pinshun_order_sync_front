import type { CommonResult } from '@/api/commonResult'
import { unwrapResult } from '@/api/commonResult'
import request from '@/utils/request'

export interface LoginParam {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  account: string
  name: string
}

export const loginApi = async (param: LoginParam): Promise<LoginResult> => {
  const { data } = await request.post<CommonResult<LoginResult>>('/pinshun/service/auth/login', param)

  const loginData = unwrapResult(data)
  if (!loginData?.token) {
    throw new Error('登录返回数据异常：缺少 token')
  }
  return loginData
}
