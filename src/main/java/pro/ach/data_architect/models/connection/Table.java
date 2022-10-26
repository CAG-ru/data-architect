package pro.ach.data_architect.models.connection;

import lombok.Data;
import lombok.EqualsAndHashCode;
import pro.ach.data_architect.models.Relation;

import java.util.ArrayList;
import java.util.List;

@Data
@EqualsAndHashCode
public class Table {
    private String name;
    private String filePath;
    private List<Column> columns = new ArrayList<>();
    private List<Relation> relations = new ArrayList<>();
}
