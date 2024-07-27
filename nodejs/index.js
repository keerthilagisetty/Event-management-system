const express = require('express');
const mongoose = require('mongoose');
const router=require('./routes/user-route');
const router1 = require("./routes/event-routes");
const adminRouter = require('./routes/admin-routes');
const bookingsRouter = require('./routes/booking-routes');
const cookieParser=require('cookie-parser')
const cors=require('cors');
require('dotenv').config()
const app = express();
app.use(cors({credentials:true,origin:"http://localhost:3000"}))
app.use(cookieParser())
app.use(express.json());
app.use('/api',router);
app.use("/admin", adminRouter);
app.use("/bookings", bookingsRouter);
app.use('/events',router1)
mongoose
  .connect(`mongodb+srv://guduguntlavarsha:${process.env.mongodbPassword}@varsha.skw0mlw.mongodb.net/mydb?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

const port = 5000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
