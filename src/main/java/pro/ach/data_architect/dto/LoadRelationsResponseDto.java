package pro.ach.data_architect.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import pro.ach.data_architect.dto.relations.ColumnDto;
import pro.ach.data_architect.dto.relations.EdgeDto;
import pro.ach.data_architect.dto.relations.GroupDto;
import pro.ach.data_architect.dto.relations.NodeDto;

@Data
public class LoadRelationsResponseDto {
    private List<String> deletedEdges=new ArrayList<>();
    private List<EdgeDto> edges;
    private List<GroupDto> groups;
    private List<NodeDto> nodes;
    private List<ColumnDto> ports;
}
