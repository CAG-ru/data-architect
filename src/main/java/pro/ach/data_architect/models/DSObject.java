package pro.ach.data_architect.models;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Data
@Component
public class DSObject {
    Map<String,Object> field=new HashMap<>();
}
