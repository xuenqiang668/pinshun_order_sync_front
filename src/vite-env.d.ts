/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASEURL: string
  readonly VITE_PORT: string
  readonly VITE_VERSION_UPDATE: string
  readonly VITE_SET_DRAWER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
