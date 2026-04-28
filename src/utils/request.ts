import axios from 'axios'

const TOKEN_KEY = 'admin_token'

const request = axios.create({
  baseURL: 'http://localhost:2602',
  timeout: 10000,
})

let clearingSessionPromise: Promise<void> | null = null

function isLoginUrl(url: string) {
  return url.includes('/auth/login')
}

function isUnauthorizedPayload(httpStatus: number, data: unknown): boolean {
  if (httpStatus === 401) return true
  if (!data || typeof data !== 'object') return false
  const d = data as { code?: number; msg?: string; message?: string }
  if (d.code === 401) return true
  const text = `${d.msg ?? ''} ${d.message ?? ''}`
  if (/未登录|登录已过期|请先登录/.test(text)) return true
  if (/token/i.test(text) && /无效|过期|失效|错误|不存在|校验失败/.test(text)) return true
  return false
}

function clearSessionAndRedirectLogin() {
  if (!clearingSessionPromise) {
    clearingSessionPromise = (async () => {
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      if (authStore.isAuthed) {
        authStore.logout()
        const { default: router } = await import('@/router')
        if (router.currentRoute.value.path !== '/login') {
          await router.replace('/login')
        }
      }
    })().finally(() => {
      clearingSessionPromise = null
    })
  }
  return clearingSessionPromise
}

request.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.token = `${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const url = response.config.url ?? ''
    if (!isLoginUrl(url) && isUnauthorizedPayload(response.status, response.data)) {
      void clearSessionAndRedirectLogin()
    }
    return response
  },
  (error) => {
    const res = error?.response
    const status = res?.status ?? 0
    const data = res?.data
    const url = error?.config?.url ?? ''
    if (!isLoginUrl(url) && isUnauthorizedPayload(status, data)) {
      void clearSessionAndRedirectLogin()
    }
    if (data?.msg) {
      return Promise.reject(new Error(data.msg))
    }
    return Promise.reject(error)
  },
)

export default request
