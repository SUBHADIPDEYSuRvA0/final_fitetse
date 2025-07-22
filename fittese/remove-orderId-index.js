// remove-orderId-index.js
// Run this script with: node remove-orderId-index.js

const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://subhadip11103:7JN5CzLsoJbmivt5@cluster0.znk8r.mongodb.net/FITETSE';
const dbName = 'FITETSE';
const collectionName = 'payments';
const indexName = 'orderId_1';

async function removeIndex() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const indexes = await collection.indexes();
    const hasOrderIdIndex = indexes.some(idx => idx.name === indexName);
    if (!hasOrderIdIndex) {
      console.log(`Index '${indexName}' does not exist. No action needed.`);
      return;
    }
    await collection.dropIndex(indexName);
    console.log(`Index '${indexName}' dropped successfully.`);
  } catch (err) {
    console.error('Error dropping index:', err.message);
  } finally {
    await client.close();
  }
}

removeIndex(); 