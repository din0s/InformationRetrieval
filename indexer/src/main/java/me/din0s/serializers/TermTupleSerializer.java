package me.din0s.serializers;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import me.din0s.pairs.TermTuple;

import java.io.IOException;
import java.io.StringWriter;

public class TermTupleSerializer extends JsonSerializer<TermTuple> {
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void serialize(TermTuple value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        StringWriter writer = new StringWriter();
        mapper.writeValue(writer, value);
        gen.writeFieldName(writer.toString());
    }
}
