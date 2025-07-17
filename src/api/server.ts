import dotenv from 'dotenv'
import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import pagesRouter from './routes/pages.js'
import indyRouter from './routes/indy.js'
import cmsRouter from './routes/cms.js'
import pageRouter from './routes/page.js'
import sitesRouter from './routes/cms/sites.js'
import entriesRouter from './routes/cms/entries.js'
import blocksRouter from './routes/cms/blocks.js'
import { prisma } from '../utils/prisma'

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
app.use('/api/cms', cmsRouter)
app.use('/api/page', pageRouter)
app.use('/api/sites', sitesRouter)
app.use('/api/entries', entriesRouter)
app.use('/api/blocks', blocksRouter)

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  })
})

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' })
})

// Start server
const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`I2E API server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

export default app 