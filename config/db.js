import mongoose from "mongoose";
import colors from "colors";

mongoose.set('debug', true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `Connected To MongoDB Database ${conn.connection.host}`.bgMagenta.white
    );
  } catch (error) {
    console.log(`Error in MongoDB ${error}`.bgRed.white);
    process.exit(1); // Exit if database connection fails
  }
};

export default connectDB;