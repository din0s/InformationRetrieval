package me.din0s.pairs;

import org.bson.types.ObjectId;

public class TermTriplet {
    private final String term;
    private final TermTuple tuple;

    public TermTriplet(String term, ObjectId docId, long termCount) {
        this.term = term;
        this.tuple = new TermTuple(docId, termCount);
    }

    public static TermTriplet merge(TermTriplet left, TermTriplet right) {
        assert left.getTerm().equals(right.getTerm());
        assert left.getDocId() == right.getDocId();
        return new TermTriplet(left.getTerm(), left.getDocId(), left.getTermCount() + right.getTermCount());
    }

    public String getTerm() {
        return term;
    }

    public TermTuple getTuple() {
        return tuple;
    }

    public ObjectId getDocId() {
        return tuple.getDocId();
    }

    public long getTermCount() {
        return tuple.getTermCount();
    }

    public String getDBEntry() {
        return String.format("(\"%s\", %d)", term, getTermCount());
    }

    @Override
    public String toString() {
        return String.format("(%s, %s, %d)", term, getDocId().toHexString(), getTermCount());
    }
}
