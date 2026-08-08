const { MongoClient } = require('mongodb');
require('dotenv').config();
MongoClient.connect(process.env.MONGODB_URI).then(async client => {
  const db = client.db('learn_opportunities');
  await db.collection('projects').updateMany(
    { category: 'StudentProject' },
    { $set: { userEmail: 'ochiwilliamotieno@gmail.com' } }
  );
  console.log('Updated project owner successfully.');
  client.close();
});
