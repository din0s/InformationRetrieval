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

class Indexer {
    @JsonSerialize(keyUsing = TermTupleSerializer.class)
    private final Map<String, List<TermTuple>> index;

    Indexer(String resultsPath) throws IOException {
        this.index = buildIndex(resultsPath);
    }

    Indexer(Map<String, List<TermTuple>> index) {
        this.index = index;
    }

    private String preprocess(String t) {
        // TODO: stemming etc here or in crawler?
        return t;
    }

    private Map<String, List<TermTuple>> buildIndex(String resultsPath) throws IOException {
        AtomicInteger docIndex = new AtomicInteger(0);
        return Files.walk(Path.of(resultsPath))
                .filter(Files::isRegularFile)
                .flatMap(filePath -> {
                    int docId = docIndex.getAndIncrement();
                    try {
                        return Files.lines(filePath)
                                .map(line -> line.split("\\s+"))
                                .flatMap(Arrays::stream)
                                .map(this::preprocess)
                                .filter(Objects::nonNull)
                                .map(t -> new TermTriplet(t, docId, 1))
                                .collect(Collectors.toMap(TermTriplet::getTerm, Function.identity(), TermTriplet::merge))
                                .values().stream();
                    } catch (IOException e) {
                        return Collections.<String, TermTriplet>emptyMap().values().stream();
                    }
                })
                .collect(Collectors.groupingBy(
                        TermTriplet::getTerm,
                        Collectors.mapping(TermTriplet::getTuple, Collectors.toList())
                ));
    }

    public void writeToFile(String filePath) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(index);
        Files.writeString(Path.of(filePath), json);
    }

    public static Indexer readFromFile(String filePath) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        TypeReference<Map<String, List<TermTuple>>> typeRef = new TypeReference<>() {};

        String json = String.join("", Files.readAllLines(Path.of(filePath)));
        return new Indexer(mapper.readValue(json, typeRef));
    }

    public Map<String, List<TermTuple>> getIndex() {
        return index;
    }
}
