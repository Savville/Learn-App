const { MongoClient } = require('mongodb');
require('dotenv').config();

MongoClient.connect(process.env.MONGODB_URI).then(async client => {
  const db = client.db('learn_opportunities');
  const coll = db.collection('projects');
  const projects = await coll.find({}).toArray();
  const statuses = ['Active', 'Showcase', 'Seeking Funding', 'Recruiting', 'Archived'];
  for (let i = 0; i < projects.length; i++) {
    await coll.updateOne({ _id: projects[i]._id }, { $set: { status: statuses[i % statuses.length] } });
  }
  console.log('Updated statuses!');
  client.close();
});
