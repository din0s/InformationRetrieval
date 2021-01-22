import os
import pymongo

class Database():
    def __init__(self, collection, drop):
        user = os.environ.get('MONGO_USERNAME')
        password = os.environ.get('MONGO_PASSWORD')
        database = os.environ.get('MONGO_DATABASE')

        client = pymongo.MongoClient(f"mongodb://{user}:{password}@mongo:27017/")
        print("Connected to database!")

        self.col = client[database][collection]
        if drop:
            self.col.drop()

        self.col.create_index([("url", pymongo.HASHED)])

    def insert(self, document):
        self.col.update_one(
            { "url": document["url"] },
            { "$set": document },
            upsert=True
        )
