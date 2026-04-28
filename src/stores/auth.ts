import { defineStore } from 'pinia'
import { loginApi } from '@/api/auth'

const TOKEN_KEY = 'admin_token'
const ACCOUNT_KEY = 'admin_account'
const NAME_KEY = 'admin_name'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    account: localStorage.getItem(ACCOUNT_KEY) || '',
    name: localStorage.getItem(NAME_KEY) || '',
  }),
  getters: {
    isAuthed: (state) => Boolean(state.token),
    username: (state) => state.name || state.account,
  },
  actions: {
    async login(username: string, password: string) {
      if (!username || !password) {
        throw new Error('用户名和密码不能为空')
      }

      const result = await loginApi({ username, password })
      this.token = result.token
      this.account = result.account
      this.name = result.name

      localStorage.setItem(TOKEN_KEY, this.token)
      localStorage.setItem(ACCOUNT_KEY, this.account)
      localStorage.setItem(NAME_KEY, this.name)
    },
    logout() {
      this.token = ''
      this.account = ''
      this.name = ''
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ACCOUNT_KEY)
      localStorage.removeItem(NAME_KEY)
    },
  },
})
