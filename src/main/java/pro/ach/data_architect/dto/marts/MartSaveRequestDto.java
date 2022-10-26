package pro.ach.data_architect.dto.marts;

import java.util.List;

import lombok.Data;
import pro.ach.data_architect.models.mart.Filter;
import pro.ach.data_architect.models.mart.MartGraph;
import pro.ach.data_architect.models.mart.MartInfo;

@Data
public class MartSaveRequestDto {
    private String martId;
    private List<Filter> martFilters;
    private MartInfo martInfo;
    private MartGraph martGraph;
}
