package me.din0s;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import me.din0s.pairs.TermTriplet;
import me.din0s.pairs.TermTuple;
import me.din0s.serializers.TermTupleSerializer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

class Indexer {
    private final Map<Integer, Integer> docSizes;

    @JsonSerialize(keyUsing = TermTupleSerializer.class)
    private final Map<String, List<TermTuple>> index;

    Indexer(String resultsPath, String docsPath) throws IOException {
        Path p = Path.of(docsPath);
        if (Files.exists(p)) {
            Files.walk(p).forEach(fp -> {
                try {
                    Files.deleteIfExists(fp);
                } catch (IOException ignored) {}
            });
            Files.deleteIfExists(p);
        }
        Files.createDirectory(p);
        this.docSizes = new HashMap<>();
        this.index = buildIndex(resultsPath, docsPath);
    }

    Indexer(Map<String, List<TermTuple>> index, Map<Integer, Integer> docSizes) {
        this.docSizes = docSizes;
        this.index = index;
    }

    private String preprocess(String t) {
        // TODO: stemming etc here or in crawler?
        return t;
    }

    private void writeEntry(int docId, String resultsPath, Path ogPath, String entryDir) throws IOException {
        String lines = String.join("", Files.readAllLines(ogPath));
        String newPath = String.format("%s%s", entryDir, docId);
        String url = ogPath.toString().substring(resultsPath.length());
        String newContent = String.format("https://%s%n%s", url, lines);
        Files.writeString(Path.of(newPath), newContent);
    }

    private Map<String, List<TermTuple>> buildIndex(String resultsPath, String docsPath) throws IOException {
        AtomicInteger docIndex = new AtomicInteger(0);
        return Files.walk(Path.of(resultsPath))
                .filter(Files::isRegularFile)
                .flatMap(filePath -> {
                    int docId = docIndex.getAndIncrement();
                    try {
                        Collection<TermTriplet> res = Files.lines(filePath)
                                .map(line -> line.split("\\s+"))
                                .flatMap(Arrays::stream)
                                .map(this::preprocess)
                                .filter(Objects::nonNull)
                                .map(t -> new TermTriplet(t, docId, 1))
                                .collect(Collectors.toMap(TermTriplet::getTerm, Function.identity(), TermTriplet::merge))
                                .values();
                        writeEntry(docId, resultsPath, filePath, docsPath);
                        docSizes.put(docId, res.size());
                        return res.stream();
                    } catch (IOException e) {
                        return Stream.empty();
                    }
                })
                .collect(Collectors.groupingBy(
                        TermTriplet::getTerm,
                        Collectors.mapping(TermTriplet::getTuple, Collectors.toList())
                ));
    }

    public void writeToFile(String indexerPath, String docSizesPath) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        String indexJson = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(index);
        String docSizesJson = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(docSizes);
        Files.writeString(Path.of(indexerPath), indexJson);
        Files.writeString(Path.of(docSizesPath), docSizesJson);
    }

    public static Indexer readFromFile(String indexerPath, String docSizesPath) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        TypeReference<Map<String, List<TermTuple>>> indexTypeRef = new TypeReference<>() {};
        TypeReference<Map<Integer, Integer>> docSizesTypeRef = new TypeReference<>() {};

        String indexJson = String.join("", Files.readAllLines(Path.of(indexerPath)));
        String docSizesJson = String.join("", Files.readAllLines(Path.of(docSizesPath)));
        Map<String, List<TermTuple>> index = mapper.readValue(indexJson, indexTypeRef);
        Map<Integer, Integer> docSizes = mapper.readValue(docSizesJson, docSizesTypeRef);
        return new Indexer(index, docSizes);
    }

    public Map<String, List<TermTuple>> getIndex() {
        return index;
    }
}
