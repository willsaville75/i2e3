import dotenv from 'dotenv'
import express, { type Request, type Response } from 'express'
import cors from 'cors'
import pagesRouter from './routes/pages'
import indyRouter from './routes/indy'

// Load environment variables first
dotenv.config()

// Debug: Check if OpenAI API key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error('⚠️  Warning: OPENAI_API_KEY is not set in environment variables')
  console.error('   Make sure your .env file contains OPENAI_API_KEY=your_key_here')
} else {
  console.log('✅ OpenAI API key loaded successfully')
}

const app = express()
const PORT = process.env.PORT || 3002

// OPTIMIZATION: Configure Express for better connection handling
app.set('trust proxy', 1)

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}))

// OPTIMIZATION: Reduce JSON limits and add connection management
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

// OPTIMIZATION: Add connection management headers
app.use((_req, res, next) => {
  // Enable keep-alive connections
  res.set('Connection', 'keep-alive')
  res.set('Keep-Alive', 'timeout=5, max=1000')
  
  // Disable response buffering for faster responses
  res.set('X-Accel-Buffering', 'no')
  
  // Add cache control for API responses
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  
  next()
})

// Routes
app.use('/api/pages', pagesRouter)
app.use('/api/indy', indyRouter)

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// OPTIMIZATION: Configure server with better connection settings
const server = app.listen(PORT, () => {
  console.log(`I2E API server running on port ${PORT}`)
})

// OPTIMIZATION: Configure server timeouts and connection limits
server.keepAliveTimeout = 5000 // 5 seconds
server.headersTimeout = 6000   // 6 seconds (slightly higher than keepAliveTimeout)
server.timeout = 30000         // 30 seconds for long AI requests
server.maxConnections = 1000   // Increase max connections

// OPTIMIZATION: Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

export default server 