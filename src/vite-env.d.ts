/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_CLIENT_URL: string
  // Add other env variables here if you have any
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
