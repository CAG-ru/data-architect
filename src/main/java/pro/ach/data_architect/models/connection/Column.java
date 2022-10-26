package pro.ach.data_architect.models.connection;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode
public class Column {
    private String name;
    private String type;
    private String comment="";
    private String description="";
    private Boolean autoincrement=false;
    private Boolean nullable=false;
    private Boolean unique=false;
    private Object defaultValue=null;
}
