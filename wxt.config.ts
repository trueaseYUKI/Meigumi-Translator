import { defineConfig } from 'wxt'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { CORS_White_List } from './assets/config'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  vite: () => ({
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  }),
  manifest: {
    name: 'Meigumi-Translator',
    description: '一个沉浸式翻译软件，即可以翻译网页又可以翻译PDF',
    permissions: ['storage'],
    host_permissions: CORS_White_List,
    icons: {
      16: 'icon/icon-16.png',
      32: 'icon/icon-32.png',
      48: 'icon/icon-48.pngg',
      128: 'icon/icon-128.png',
    },
  },
})
