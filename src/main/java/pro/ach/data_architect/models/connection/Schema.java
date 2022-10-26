package pro.ach.data_architect.models.connection;

import lombok.Data;
import lombok.EqualsAndHashCode;
import pro.ach.data_architect.models.Relation;

import java.util.ArrayList;
import java.util.List;

@Data
@EqualsAndHashCode
public class Schema {
    String name;
    private List<Table> tables = new ArrayList<>();

    public List<Relation> getRelations() {
        return tables.stream().reduce(
                new ArrayList<>(),
                (accum, table) -> {
                    accum.addAll(table.getRelations());
                    return accum;
                },
                (t1, t2) -> {
                    t1.addAll(t2);
                    return t1;
                });


    }
}
