package pro.ach.data_architect.models.connection;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode
public class PKey {
    private String name;
    private String type;
}
