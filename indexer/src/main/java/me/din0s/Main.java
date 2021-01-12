package me.din0s;

import me.din0s.pairs.TermTuple;

import java.io.IOException;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) throws IOException {
        boolean read = args.length != 0 && args[0].equalsIgnoreCase("--read");
        String destPath = args.length < 2 ? "./indexer.json" : args[1];
        if (read) {
            // java -jar indexer.jar --read ./indexer.json
            Indexer indexer = Indexer.readFromFile(destPath);
            indexer.getIndex().forEach((term, list) -> {
                String s = list.stream().map(TermTuple::toString).collect(Collectors.joining(", "));
                System.out.printf("%s -> [%d: %s]%n", term, list.size(), s);
            });
        } else {
            // java -jar indexer.jar ./results/ ./indexer.json
            String resultsPath = args.length < 1 ? "./results/" : args[0];
            Indexer indexer = new Indexer(resultsPath);
            indexer.writeToFile(destPath);
        }
    }
}
