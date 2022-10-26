package pro.ach.data_architect.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import pro.ach.data_architect.dto.LoadRelationsResponseDto;
import pro.ach.data_architect.dto.relations.EdgeDto;
import pro.ach.data_architect.dto.relations.GroupDto;
import pro.ach.data_architect.dto.relations.NodeDto;
import pro.ach.data_architect.models.MetaData;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.services.ConnectService;
import pro.ach.data_architect.services.MetaDataService;
import pro.ach.data_architect.services.RelationService;

@Controller
@RequestMapping(value = "/relations")
public class RelationController {

    private ConnectService connectService;
    private MetaDataService metaDataService;
    private RelationService relationService;

    @Autowired
    public RelationController(ConnectService connectService, MetaDataService metaDataService, RelationService relationService) {
        this.connectService = connectService;
        this.metaDataService = metaDataService;
        this.relationService = relationService;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("source_connections", connectService.getLoadedSourceConnections());
        return "relations/index";
    }

    @GetMapping("/load/")
    public ResponseEntity loadRelations(@RequestParam(value = "cid[]") List<String> ids) {
        Map<String, Object> result = new HashMap<>();
        List<Connection> connections = connectService.getConnectionsById(ids);
        List<MetaData> metaDataList = metaDataService.
                getMetaDataLastVersionByConnects(connections);

        result.put("edges", relationService
                .getRelationsByMetadata(metaDataList)
                .stream()
                .map(EdgeDto::create)
                .collect(Collectors.toList())
        );
        result.put("nodes",metaDataList.stream().map(NodeDto::create).collect(Collectors.toList()));
        result.put("groups", connections
                .stream()
                .map((connection) -> GroupDto.create(connection, 1))
                .collect(Collectors.toList())
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/edit/")
    public String edit(Model model, @RequestParam(value = "cid[]") List<String> ids) {
        model.addAttribute("id", ids);
        return "relations/edit_relations";
    }

    @PostMapping("/save/")
    public ResponseEntity save(@RequestBody LoadRelationsResponseDto request){
        relationService.saveList(request.getEdges());
        if(request.getDeletedEdges().size()>0){
            relationService.deleteByIds(request.getDeletedEdges());
        }
        return ResponseEntity.ok("");
    }
}
