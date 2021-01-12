package me.din0s.pairs;

import com.fasterxml.jackson.annotation.JsonValue;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TermTuple {
    private static final Pattern TUPLE_PATTERN = Pattern.compile("\\((\\d+), (\\d+)\\)");

    private final long docId;
    private final long termCount;

    public TermTuple(long docId, long termCount) {
        this.docId = docId;
        this.termCount = termCount;
    }

    public TermTuple(String s) {
        Matcher m = TUPLE_PATTERN.matcher(s);
        if (!m.find()) {
            throw new IllegalArgumentException("Unsupported format: " + s);
        }
        this.docId = Long.parseLong(m.group(1));
        this.termCount = Long.parseLong(m.group(2));
    }

    public long getDocId() {
        return docId;
    }

    public long getTermCount() {
        return termCount;
    }

    @Override
    @JsonValue
    public String toString() {
        return String.format("(%d, %d)", docId, termCount);
    }
}
