package pro.ach.data_architect.models.mart;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Data
public class MartGraph {
    private Set<EdgeMart> edges;
    private String entityId;
    private List<Object> groups;
    private Set<NodeMart> nodes;

    public List<ColumnMart> getSelectedColumns() {
        return nodes.stream().reduce(
                new ArrayList<ColumnMart>(),
                (accum, node) -> {
                    accum.addAll(
                            node.getColumns()
                                    .stream()
                                    .filter(ColumnMart::getSelected)
                                    .collect(Collectors.toList())
                    );

                    return accum;
                },
                (a1, a2) -> {
                    a1.addAll(a2);
                    return a1;
                }
        );
    }
}
