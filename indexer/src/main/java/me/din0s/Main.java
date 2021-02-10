package me.din0s;

import java.io.IOException;
import java.util.concurrent.ExecutionException;

public class Main {
    public static void main(String[] args) throws IOException, ExecutionException, InterruptedException {
        boolean read = args.length != 0 && args[0].equalsIgnoreCase("--read");
        String indexPath = args.length <= 1 ? "./indexer/index.json" : args[1];
        if (read) {
            // java -jar indexer/indexer.jar --read ./indexer/index.json
            Indexer.printFile(indexPath);
        } else {
            // java -jar indexer/indexer.jar webpages ./indexer/index.json
            String colName = args.length == 0 ? "webpages" : args[0];
            Indexer indexer = new Indexer(colName);
            indexer.writeToFile(indexPath);
        }
    }
}
