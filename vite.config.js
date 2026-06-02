import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.resolve(__dirname, 'users.json')

// Helper to read users from users.json
function readUsers() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify([], null, 2), 'utf8')
    }
    const data = fs.readFileSync(dbPath, 'utf8')
    return JSON.parse(data) || []
  } catch (e) {
    console.error('Failed to read database:', e)
    return []
  }
}

// Helper to write users to users.json
function writeUsers(users) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2), 'utf8')
  } catch (e) {
    console.error('Failed to write database:', e)
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-api-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Check if url starts with /api/users
          if (req.url && (req.url === '/api/users' || req.url.startsWith('/api/users?'))) {
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

            if (req.method === 'OPTIONS') {
              res.statusCode = 200
              res.end()
              return
            }

            if (req.method === 'GET') {
              const users = readUsers()
              res.statusCode = 200
              res.end(JSON.stringify(users))
              return
            }

            if (req.method === 'PUT') {
              let body = ''
              req.on('data', chunk => {
                body += chunk.toString()
              })
              req.on('end', () => {
                try {
                  const users = JSON.parse(body)
                  writeUsers(users)
                  res.statusCode = 200
                  res.end(JSON.stringify({ success: true, count: users.length }))
                } catch (e) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ error: 'Invalid JSON body' }))
                }
              })
              return
            }
          }
          next()
        })
      }
    }
  ],
  server: {
    host: true // Exposes Vite on your local network (LAN) so mobile phones can connect
  }
})
