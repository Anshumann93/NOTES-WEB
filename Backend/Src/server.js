import mongoose from "mongoose";
import dotenv from "dotenv"
import ConnectDB from "./Db/connect.db.js";

dotenv.config({path:"./.env"})

ConnectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
