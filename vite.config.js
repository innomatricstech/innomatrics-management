// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/users': {
//         target: 'http://localhost:3000',  
//         changeOrigin: true,
//         secure: false,  
//       },
//       '/projects': {
//         target: 'http://localhost:3000',
//         changeOrigin: true,
//         secure: false,
//       },
//       '/taskBoards': {
//         target: 'http://localhost:3000',  
//         changeOrigin: true,
//         secure: false,
//       },
//       '/messages': {
//         target: 'http://localhost:3000',  
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/users': {
        target: 'https://inno-project-system-server.vercel.app/', 
        changeOrigin: true,
        secure: false,
      },
      '/projects': {
        target: 'https://inno-project-system-server.vercel.app/',
        changeOrigin: true,
        secure: false,
      },
      '/taskBoards': {
        target: 'https://inno-project-system-server.vercel.app/',  
        changeOrigin: true,
        secure: false,
      },
      '/messages': {
        target: 'https://inno-project-system-server.vercel.app/',  
        changeOrigin: true,
        secure: false,
      },
    },
  },
})


