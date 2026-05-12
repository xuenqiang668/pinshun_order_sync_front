<script setup lang="ts">
import { Lock, User } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { APP_SHORT_NAME, APP_SYSTEM_NAME } from '@/config/app'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

/** 背景图置于 public/images/login-bg.jpg，随 Vite base 拼接路径 */
const loginPageStyle = {
  '--login-bg-url': `url('${import.meta.env.BASE_URL}images/login-bg.jpg')`,
} as const

const form = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const onSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await authStore.login(form.username, form.password)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page" :style="loginPageStyle">
    <div class="login-page-bg" aria-hidden="true" />
    <div class="login-page-noise" aria-hidden="true" />

    <div class="login-page-content">
      <div class="login-card">
        <header class="login-card-header">
          <div class="login-logo" aria-hidden="true">
            <span class="login-logo-text">{{ APP_SHORT_NAME.charAt(0) }}</span>
          </div>
          <h1 class="login-title">{{ APP_SYSTEM_NAME }}</h1>
          <p class="login-subtitle">请登录管理后台</p>
        </header>

        <el-form
          ref="formRef"
          class="login-form"
          :model="form"
          :rules="rules"
          label-position="top"
          require-asterisk-position="right"
          @keyup.enter="onSubmit"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model.trim="form.username"
              size="large"
              placeholder="请输入用户名"
              clearable
              autocomplete="username"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model.trim="form.password"
              size="large"
              type="password"
              show-password
              placeholder="请输入密码"
              clearable
              autocomplete="current-password"
              :prefix-icon="Lock"
            />
          </el-form-item>
          <el-button type="primary" size="large" class="login-submit" :loading="loading" @click="onSubmit">
            登 录
          </el-button>
        </el-form>
      </div>

      <p class="login-footer">© {{ APP_SHORT_NAME }}</p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem 2rem;
  overflow: hidden;
}

.login-page-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(165deg, rgb(15 23 42 / 0.62) 0%, rgb(30 64 175 / 0.42) 42%, rgb(248 250 252 / 0.9) 100%),
    linear-gradient(115deg, rgb(37 99 235 / 0.18) 0%, transparent 52%), var(--login-bg-url);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-page-noise {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
}

.login-page-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 26rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.login-card {
  width: 100%;
  border-radius: 1.25rem;
  border: 1px solid rgb(255 255 255 / 0.65);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.92) 0%, rgb(248 250 252 / 0.96) 100%);
  box-shadow:
    0 0 0 1px rgb(15 23 42 / 0.04),
    0 24px 48px rgb(15 23 42 / 0.08),
    0 2px 8px rgb(15 23 42 / 0.04);
  backdrop-filter: blur(12px);
  padding: 2rem 1.75rem 1.75rem;
}

@media (min-width: 480px) {
  .login-card {
    padding: 2.25rem 2rem 2rem;
  }
}

.login-card-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.login-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  margin-bottom: 1rem;
  border-radius: 1rem;
  background: linear-gradient(145deg, #3b82f6 0%, #1d4ed8 48%, #1e3a8a 100%);
  box-shadow:
    0 10px 24px rgb(37 99 235 / 0.35),
    inset 0 1px 0 rgb(255 255 255 / 0.25);
  border: 1px solid rgb(255 255 255 / 0.2);
}

.login-logo-text {
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.15);
}

.login-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
  line-height: 1.3;
}

.login-subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.login-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #475569;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 0.625rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  transition:
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #cbd5e1 inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px var(--el-color-primary) inset,
    0 0 0 3px rgb(59 130 246 / 0.15);
}

.login-submit {
  width: 100%;
  margin-top: 0.5rem;
  height: 2.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  border-radius: 0.625rem;
  box-shadow: 0 4px 14px rgb(37 99 235 / 0.35);
}

.login-footer {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(100 116 139 / 0.95);
  letter-spacing: 0.04em;
  text-shadow: 0 1px 2px rgb(255 255 255 / 0.5);
}
</style>
