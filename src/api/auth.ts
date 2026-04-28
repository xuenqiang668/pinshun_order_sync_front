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

interface CommonResult<T> {
  code?: number
  msg?: string
  message?: string
  data?: T
}

export const loginApi = async (param: LoginParam): Promise<LoginResult> => {
  const { data } = await request.post<CommonResult<LoginResult>>(
    '/pinshun/service/auth/login',
    param,
  )

  const success = data.code === undefined || data.code === 0 || data.code === 200
  if (!success) {
    throw new Error(data.msg || data.message || '登录失败')
  }

  if (!data.data?.token) {
    throw new Error('登录返回数据异常：缺少 token')
  }

  return data.data
}
