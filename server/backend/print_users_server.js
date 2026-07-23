const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/petlink');
  const users = await User.find({});
  console.log('USERS IN DB:');
  users.forEach(u => {
    console.log(`- Email: ${u.email}, Role: ${u.role}, Name: ${u.name}`);
  });
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
