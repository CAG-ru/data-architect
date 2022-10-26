package pro.ach.data_architect.models.handbook;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;
import pro.ach.data_architect.models.handbook.enums.TypeHandBook;

import javax.persistence.Id;

@Data
@Document
public class HandBook {
    @Id
    private String id;
    private String name;
    private String description;
    private TypeHandBook type;
}
