require('dotenv').config();
const connectDB = require('./Src/config/db');
const app = require('./Src/app');

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.log('MongoDB connection failed !!! ', err);
  });
