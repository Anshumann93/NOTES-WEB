import mongoose from "mongoose";

const ConnectDB = async()=>{
  try{
     const conectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
    console.log(`"Mongo db connected || HOST: "
      ${conectionInstance.connection.host}
     `)
  }
  catch(error){
     console.log("MONGODB connection FAILED ", error);
        process.exit(1)
  }
}

export default ConnectDB