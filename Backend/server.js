require('dotenv').config();
const connectDB = require('./src/config/db');
const app = require('./src/app');

// Initialize BullMQ Workers
require('./src/queue/generator.worker');

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.log('MongoDB connection failed !!! ', err);
  });
