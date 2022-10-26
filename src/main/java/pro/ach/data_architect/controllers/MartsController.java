package pro.ach.data_architect.controllers;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javassist.NotFoundException;
import lombok.RequiredArgsConstructor;
import pro.ach.data_architect.dto.marts.MartDataTableResponseDto;
import pro.ach.data_architect.dto.marts.MartSaveRequestDto;
import pro.ach.data_architect.models.Entity;
import pro.ach.data_architect.models.MetaData;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.mart.EdgeMart;
import pro.ach.data_architect.models.mart.Mart;
import pro.ach.data_architect.models.mart.MartAdditional;
import pro.ach.data_architect.models.mart.NodeMart;
import pro.ach.data_architect.models.mart.enums.AccessMode;
import pro.ach.data_architect.models.mart.enums.EssenceDataEmergence;
import pro.ach.data_architect.models.mart.enums.IntervalOfUpdating;
import pro.ach.data_architect.services.ConnectService;
import pro.ach.data_architect.services.EntityService;
import pro.ach.data_architect.services.MartService;
import pro.ach.data_architect.services.MetaDataService;
import pro.ach.data_architect.services.RelationService;

@Controller
@RequiredArgsConstructor
@RequestMapping(value = "/marts")
public class MartsController {

    private final MartService martService;
    private final EntityService entityService;
    private final RelationService relationService;
    private final ConnectService connectService;
    private final MetaDataService metaDataService;


    @GetMapping("/")
    public String index(Model model, @RequestParam(required = false) Integer page) {
        page = page == null ? 0 : page - 1;
        model.addAttribute("mart_con", martService.getAll(PageRequest.of(page, 10)));
        return "marts/index";
    }

    @GetMapping("/edit_addition/{id}")
    public String editAddition(Model model, @PathVariable("id") Mart mart) {
        model.addAttribute("mart", mart);
        return "marts/edit_addition";
    }

    @GetMapping("/manage-mart")
    public String index(Model model, HttpServletRequest request) {
        String id = request.getParameter("cid");
        String entityId = request.getParameter("entity_id");
        if (id != null) {
            Mart mart = martService.findById(id);
            model.addAttribute("mart", mart);
            entityId = entityId != null || mart == null ? entityId : mart.getEntity().getId();
        }
        model.addAttribute("mart_id", id);
        model.addAttribute("entity_id", entityId);

        return "marts/edit_mart";
    }

    @GetMapping("/viewmart/{id}")
    public String index(@PathVariable String id, Model model) {
        model.addAttribute("mart", martService.findById(id));
        return "marts/view_mart";
    }


    @GetMapping("/get-by-id/{id}")
    public ResponseEntity getById(@PathVariable String id) {
        Map<String, Object> result = new HashMap<>();
        result.put("mart", martService.findById(id));
        result.put("entities", entityService.getAll());
        result.put("THE_ESSENCE_OF_DATA_EMERGENCE", EssenceDataEmergence.values());
        result.put("REGULARITY_OF_DATA_SET_UPDATE", IntervalOfUpdating.values());
        result.put("ACCESS_MODE", AccessMode.values());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/get-diagram-data")
    public ResponseEntity getDiagramData(HttpServletRequest request) {
        String entityId = request.getParameter("entity_id");
        String martId = request.getParameter("mart_id");
        Map<String, Object> result = new HashMap<>();
        Entity entity = entityService.findById(entityId);
        if (martId != null) {
            Mart mart = martService.findById(martId);
            if (mart != null) {
                return ResponseEntity.ok(mart.getMartGraph());
            }
        }
        if (entity != null) {
            Connection connection = connectService.findById(entity.getConnectId());
            List<Connection> connections = connectService.getRelatedConnectionsByConnection(connection);
            List<MetaData> metaData = metaDataService.getMetaDataLastVersionByConnects(connections);
            result.put("entity_id", entityId);
            result.put("edges", relationService.getRelationsByMetadata(metaData)
                    .stream().map(EdgeMart::create)
                    .collect(Collectors.toList())
            );
            result.put("nodes", metaData
                    .stream()
                    .sorted((a, b) -> a.getId().equals(entity.getMetadataId()) ? -1 : 1)
                    .map(NodeMart::create)
                    .collect(Collectors.toList()));


            result.put("groups", new ArrayList<>());
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/save")
    public ResponseEntity save(@RequestBody MartSaveRequestDto request) throws NotFoundException {
        Mart mart = new Mart();
        if (request.getMartId() != null) {
            mart.setId(request.getMartId());
        }
        mart.setMartFilters(request.getMartFilters());
        mart.setMartInfo(request.getMartInfo());
        mart.setMartGraph(request.getMartGraph());
        martService.save(mart);
        return ResponseEntity.ok("");
    }

    @PostMapping("/save-additional/{id}")
    public ResponseEntity save(@PathVariable("id") Mart mart, @RequestBody MartAdditional additional) throws NotFoundException {
        mart.setMartAdditional(additional);
        martService.save(mart);
        return ResponseEntity.ok("");
    }

    @GetMapping("/create-table/{id}")
    public String createTable(@PathVariable String id) throws NotFoundException {
        martService.createTable(martService.findById(id));
        return "redirect:/marts/";
    }

    @GetMapping("/delete/{id}")
    public String delete(@PathVariable String id) throws NotFoundException, SQLException {
        martService.delete(martService.findById(id));
        return "redirect:/marts/";
    }

    @GetMapping("/get-data-by-mart-table/{id}")
    public ResponseEntity<MartDataTableResponseDto> getDataByMartTable(@PathVariable("id") Mart mart) throws SQLException, NotFoundException {
        MartDataTableResponseDto response = new MartDataTableResponseDto();
        response.setTableData(martService.getDataByMartTable(mart));
        response.setTableColumns(mart.getMartGraph().getSelectedColumns());
        return ResponseEntity.ok(response);
    }

    @GetMapping("delete-old-marts")
    public String deleteOldMarts() throws SQLException {
        martService.deleteOldMarts();
        return "redirect:/marts/";
    }


}
