import mongoose from 'mongoose'
import app from './app.js'
import { connectDb } from './config/db.js'
import { env } from './config/env.js'

try {
  await connectDb()
} catch (err) {
  console.error(`Could not connect to MongoDB: ${err.message}`)
  console.error('Check MONGODB_URI in your .env file and that MongoDB is running.')
  process.exit(1)
}

const server = app.listen(env.port, () => console.log(`OUINSHOP API listening on http://localhost:${env.port}`))

const shutdown = async () => {
  server.close()
  await mongoose.disconnect()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
