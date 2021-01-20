package me.din0s;

import me.din0s.pairs.TermTuple;

import java.io.IOException;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) throws IOException {
        boolean read = args.length != 0 && args[0].equalsIgnoreCase("--read");
        String indexPath = args.length < 2 ? "./index/" : args[1];
        if (read) {
            // java -jar indexer/indexer.jar --read ./index/
            Indexer indexer = Indexer.readFromFile(indexPath);
            indexer.getIndex().forEach((term, list) -> {
                String s = list.stream().map(TermTuple::toString).collect(Collectors.joining(", "));
                System.out.printf("%s -> [%d: %s]%n", term, list.size(), s);
            });
        } else {
            // java -jar indexer/indexer.jar ./results/ ./index/ ./summaries/
            String resultsPath = args.length < 1 ? "./results/" : args[0];
            String summariesPath = args.length < 4 ? "./summaries/" : args[3];
            Indexer indexer = new Indexer(resultsPath, summariesPath);
            indexer.writeToFile(indexPath);
        }
    }
}
