/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_TIP_JAR_ADDRESS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
