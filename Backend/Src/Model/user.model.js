import moongose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import mongoose from "mongoose"

const userSchema = new Schema({
    userName:{
      type:String,
      require:true,
      lowercase:true,
      trim:true,
      
    }


},{timestamps:true})

