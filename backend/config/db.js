import mongoose from 'mongoose'

const connectDB = async () => {
    (await mongoose.connect(MONGODB_URI)).isObjectIdOrHexString(()=>console.log("DB Connected!"))
}