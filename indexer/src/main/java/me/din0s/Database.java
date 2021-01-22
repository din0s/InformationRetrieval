package me.din0s;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

public class Database {
    private static final String MONGO_USER = System.getenv("MONGO_USERNAME");
    private static final String MONGO_PASSWORD = System.getenv("MONGO_PASSWORD");
    private static final String MONGO_DATABASE = System.getenv("MONGO_DATABASE");

    private final MongoCollection<Document> col;

    Database(String collection) {
        Logger.getLogger("org.mongodb.driver").setLevel(Level.SEVERE);
        String uri = String.format("mongodb://%s:%s@mongo:27017/", MONGO_USER, MONGO_PASSWORD);
        MongoClient mongoClient = new MongoClient(new MongoClientURI(uri));
        MongoDatabase database = mongoClient.getDatabase(MONGO_DATABASE);
        this.col = database.getCollection(collection);
    }

    Stream<Document> stream() {
        return stream(false);
    }

    Stream<Document> parallelStream() {
        return stream(true);
    }

    private Stream<Document> stream(boolean parallel) {
        return StreamSupport.stream(this.col.find().spliterator(), parallel);
    }

    void save(Document doc) {
        Document searchQuery = new Document("url", doc.get("url"));
        Document setQuery = new Document("$set", doc);
        this.col.updateOne(searchQuery, setQuery);
    }
}
