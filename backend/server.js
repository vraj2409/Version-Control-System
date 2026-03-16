const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const mainRouter = require('./routes/main_router');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/', mainRouter);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error('Error connecting to MongoDB: ', err));