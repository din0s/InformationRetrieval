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

    Indexer(String resultsPath, String summariesPath) throws IOException {
        Path p = Path.of(summariesPath);
        if (Files.exists(p)) {
            Files.walk(p).forEach(fp -> {
                try {
                    Files.deleteIfExists(fp);
                } catch (IOException ignored) {}
            });
        } else {
            Files.createDirectory(p);
        }
        this.docSizes = new HashMap<>();
        this.index = buildIndex(resultsPath, summariesPath);
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
        List<String> lines = Files.readAllLines(ogPath);
        String title = lines.get(0);
        String summary = lines.get(1);
        String url = ogPath.toString().substring(resultsPath.length());
        String newContent = String.format("https://%s%n%s%n%s", url, title, summary);
        String newPath = String.format("%s%s", entryDir, docId);
        Files.writeString(Path.of(newPath), newContent);
    }

    private Map<String, List<TermTuple>> buildIndex(String resultsPath, String summariesPath) throws IOException {
        AtomicInteger docIndex = new AtomicInteger(0);
        return Files.walk(Path.of(resultsPath))
                .filter(Files::isRegularFile)
                .flatMap(filePath -> {
                    int docId = docIndex.getAndIncrement();
                    try {
                        Collection<TermTriplet> res = Files.lines(filePath)
                                .skip(2)
                                .map(line -> line.split("\\s+"))
                                .flatMap(Arrays::stream)
                                .map(this::preprocess)
                                .filter(Objects::nonNull)
                                .map(t -> new TermTriplet(t, docId, 1))
                                .collect(Collectors.toMap(TermTriplet::getTerm, Function.identity(), TermTriplet::merge))
                                .values();
                        writeEntry(docId, resultsPath, filePath, summariesPath);
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

    public void writeToFile(String indexPath) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        String indexJson = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(index);
        String docSizesJson = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(docSizes);
        Files.writeString(Path.of(indexPath + "/index.json"), indexJson);
        Files.writeString(Path.of(indexPath + "/docSizes.json"), docSizesJson);
    }

    public static Indexer readFromFile(String indexPath) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        TypeReference<Map<String, List<TermTuple>>> indexTypeRef = new TypeReference<>() {};
        TypeReference<Map<Integer, Integer>> docSizesTypeRef = new TypeReference<>() {};

        String indexJson = String.join("", Files.readAllLines(Path.of(indexPath + "/index.json")));
        String docSizesJson = String.join("", Files.readAllLines(Path.of(indexPath + "/docSizes.json")));
        Map<String, List<TermTuple>> index = mapper.readValue(indexJson, indexTypeRef);
        Map<Integer, Integer> docSizes = mapper.readValue(docSizesJson, docSizesTypeRef);
        return new Indexer(index, docSizes);
    }

    public Map<String, List<TermTuple>> getIndex() {
        return index;
    }
}
