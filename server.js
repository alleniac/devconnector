const express = require('express');
const connectDb = require('./config/db');

const app = express();

// Connect database
connectDb();

app.get('/', (req, res) => res.send('API running...'));

// Define routes
app.use('/api/user', require('./routes/user'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/post', require('./routes/post'));
app.use('/api/profile', require('./routes/profile'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
