package pro.ach.data_architect.models.mart;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class TableData {
    Map<String,String> data=new HashMap<>();
}
