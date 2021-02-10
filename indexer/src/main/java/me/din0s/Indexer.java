package me.din0s;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import me.din0s.pairs.TermTriplet;
import me.din0s.pairs.TermTuple;
import me.din0s.serializers.TermTupleSerializer;
import org.bson.types.ObjectId;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ForkJoinPool;
import java.util.function.Function;
import java.util.stream.Collectors;

class Indexer {
    private final Database db;

    @JsonSerialize(keyUsing = TermTupleSerializer.class)
    private final Map<String, List<TermTuple>> index;

    Indexer(String colName) throws ExecutionException, InterruptedException {
        this.db = new Database(colName);
        this.index = buildIndex();
    }

    private Map<String, List<TermTuple>> buildIndex() throws ExecutionException, InterruptedException {
        String threadCount = System.getenv("THREADS");
        int threads = threadCount == null ? 1 : Integer.parseInt(threadCount);
        ForkJoinPool pool = new ForkJoinPool(threads);
        System.out.printf("Running with %d threads.%n", pool.getParallelism());

        return pool.submit(() -> db.stream(threads > 1)
                .flatMap(doc -> {
                    @SuppressWarnings("unchecked")
                    List<String> content = doc.get("content", List.class);
                    Collection<TermTriplet> res = content.stream()
                            .map(t -> new TermTriplet(t, doc.get("_id", ObjectId.class), 1))
                            .collect(Collectors.toMap(TermTriplet::getTerm, Function.identity(), TermTriplet::merge))
                            .values();
                    doc.put("size", res.size());
                    doc.put("terms", res.stream().map(TermTriplet::getDBEntry).collect(Collectors.toList()));
                    db.save(doc);
                    return res.stream();
                }).collect(Collectors.groupingBy(
                        TermTriplet::getTerm,
                        Collectors.mapping(TermTriplet::getTuple, Collectors.toList())
                ))).get();
    }

    public void writeToFile(String indexPath) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        String indexJson = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(index);
        Files.writeString(Path.of(indexPath), indexJson);
    }

    public static void printFile(String indexPath) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        TypeReference<Map<String, List<TermTuple>>> indexTypeRef = new TypeReference<>() {};

        String indexJson = String.join("", Files.readAllLines(Path.of(indexPath)));
        Map<String, List<TermTuple>> index = mapper.readValue(indexJson, indexTypeRef);
        index.forEach((term, list) -> {
            String s = list.stream().map(TermTuple::toString).collect(Collectors.joining(", "));
            System.out.printf("%s -> [%d: %s]%n", term, list.size(), s);
        });
    }
}
