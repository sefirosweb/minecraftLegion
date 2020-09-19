const config = require('../../../../config')

const { MongoClient, ObjectId } = require('mongodb')

const DB_USER = encodeURIComponent(config.DB_USER);
const DB_PASSWORD = encodeURIComponent(config.DB_PASSWORD);
const DB_NAME = config.DB_NAME;
const DB_HOST = config.DB_HOST
const DB_PORT = config.DB_PORT

const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?retryWrites=true&w=majority`;

class MongoLib {
    constructor() {
        this.client = new MongoClient(MONGO_URI, { useNewUrlParser: true })
        this.dbName = DB_NAME
    }

    connect() {
        if (!MongoLib.connection) {
            MongoLib.connection = new Promise((resolve, reject) => {
                this.client.connect(err => {
                    if (err) {
                        reject(err);
                    }

                    console.log('Conneced to DB succesfully');
                    resolve(this.client.db(this.dbName));
                });
            });
        }

        return MongoLib.connection;
    }

    getAll(collection, query) {
        return this.connect()
            .then(db => {
                return db.collection(collection).find(query).toArray();
            })
    }

    get(collection, id) {
        return this.connect()
            .then(db => {
                return db.collection(collection).findOne({ _id: ObjectId(id) });
            })
    }

    create(collection, data) {
        return this.connect()
            .then(db => {
                return db.collection(collection).insertOne(data);

            })
            .then(result => {
                return result.insertedId
            });
    }

    createBatch(collection, data) {
        return this.connect()
            .then(db => {
                return db.collection(collection).insertMany(data);

            })
            .then(result => {
                // TDO no si el return funciona
                return result.insertedCount
            });
    }

    update(collection, id, data) {
        return this.connect()
            .then(db => {
                return db.collection(collection).updateOne({ _id: ObjectId(id) }, { $set: data }, { upsert: true });
            })
            .then(result => result.upsertedId || id);
    }

    delete(collection, id) {
        return this.connect()
            .then(db => {
                return db.collection(collection).deleteOne({ _id: ObjectId(id) });
            })
            .then(() => id);
    }

}

module.exports = MongoLib;
