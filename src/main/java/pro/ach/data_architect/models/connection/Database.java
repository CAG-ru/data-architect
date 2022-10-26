package pro.ach.data_architect.models.connection;

import lombok.Data;
import pro.ach.data_architect.models.Relation;

import java.util.ArrayList;
import java.util.List;

@Data
public class Database {
    private String name;
    private List<Schema> schemas = new ArrayList<>();

    public List<Relation> getRelations() {
        return schemas.stream().reduce(
                new ArrayList<>(),
                (accum, t) -> {
                    accum.addAll(t.getRelations());
                    return accum;
                },
                (t1, t2) -> {
                    t1.addAll(t2);
                    return t1;
                });
    }
}
