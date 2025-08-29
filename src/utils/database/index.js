import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Initiating Dot Env
dotenv.config()

export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)

    console.log('Connection has been established successfully to database')
  } catch (error) {
    console.log('Unable to connect to the database, error:', error)
  }
}

export const useSession = async (callback) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()
    const res = await callback(session)
    await session.commitTransaction()

    return res
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}
