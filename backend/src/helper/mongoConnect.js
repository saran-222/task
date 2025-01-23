import mongoose from "mongoose"

const Connect = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('MongoDB connected successfully!');
      } catch (error) {
        console.error('MongoDB connection failed:', error);
      }
}

export default Connect