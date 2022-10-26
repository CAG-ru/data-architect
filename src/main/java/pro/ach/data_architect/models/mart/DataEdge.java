package pro.ach.data_architect.models.mart;

import lombok.Data;

@Data
public class DataEdge {

    private String type;

    public DataEdge(String type) {
        this.type = type;
    }

    public DataEdge() {
    }
}
