import mongoose from "mongoose";

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  // const uri =
  //   process.env.NODE_ENV === "production"
  //     ? process.env.MONGODB_URI
  //     : process.env.MONGODB_URI;
  await mongoose
    .connect(uri)
    .then(() => {
      console.log("Mongodb connected");
    })
    .catch((error) => {
      throw error;
    });
};
export default connectDatabase;
