import mongoose from 'mongoose';

// MongoDB connection URI (replace with your actual URI)
const MONGODB_URI = 'mongodb+srv://garvb1404:admin@cluster0.xixjn.mongodb.net/customer?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB; 