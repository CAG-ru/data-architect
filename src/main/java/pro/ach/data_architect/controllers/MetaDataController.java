package pro.ach.data_architect.controllers;

import java.security.Principal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import javassist.NotFoundException;
import pro.ach.data_architect.models.MetaData;
import pro.ach.data_architect.models.connection.Column;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.services.ConnectService;
import pro.ach.data_architect.services.MetaDataService;

@Controller
@RequestMapping(value = "/meta-data")
public class MetaDataController {
    private MetaDataService metaDataService;
    private ConnectService connectService;

    @Autowired
    public MetaDataController(MetaDataService metaDataService, ConnectService connectService) {
        this.metaDataService = metaDataService;
        this.connectService = connectService;
    }

    @GetMapping("/get-by-connection-id/{connectionId}")
    public ResponseEntity getMetaDatasByConnectionId(@PathVariable String connectionId, HttpServletRequest request) throws NotFoundException, ParseException {
        Map<String, Object> result = new HashMap<>();
        Date version = null;

        if (request.getParameter("version") != null) {
            SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            version=df.parse(request.getParameter("version"));
        }
        Connection connection = connectService.findById(connectionId);
        if(connection==null){
            throw new NotFoundException("connection not found");
        }
        if(version==null){
            version=connection.getLastVersion();
        }
        result.put("metadatas", metaDataService.getMetaData(connection.getId(),version));
        result.put("source_conn", connection);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/get-by-id/{id}")
    public ResponseEntity getMetaDataById(@PathVariable String id, Principal principal) {
        Map<String, Object> result = new HashMap<>();
        MetaData metaData = metaDataService.findById(id);
        result.put("QUALITY_CONTROL_STATUS", new ArrayList<>());
        result.put("PG_TYPES_2_PANDAS_TYPES", new ArrayList<>());
        result.put("logical_types", new ArrayList<>());
        result.put("metadata", metaData);
        result.put("user", principal.getName());
        if (metaData != null) {
            result.put("source_conn", connectService.findById(metaData.getConnectId()));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/get-data/{id}")
    public ResponseEntity getMetaDataDataById(@PathVariable String id) throws NotFoundException {
        Map<String, Object> result = new HashMap<>();
        List<String> data = metaDataService.getMetaDataDataById(id);
        MetaData metaData = metaDataService.findById(id);
        result.put("QUALITY_CONTROL_STATUS", new ArrayList<>());
        result.put("PG_TYPES_2_PANDAS_TYPES", new ArrayList<>());
        result.put("logical_types", new ArrayList<>());
        result.put("metadata", metaData);
        result.put("data_json", data);
        if (metaData != null) {
            result.put("source_conn", connectService.findById(metaData.getConnectId()));
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/save/{id}")
    public ResponseEntity<MetaData> save(@PathVariable("id") MetaData metaData,@RequestBody MetaData metaDataRequest) {
        metaData.setComment(metaDataRequest.getComment());
        metaData.setDescription(metaDataRequest.getDescription());
        // metaData.setNeedQualityControl(metaDataRequest.getNeedQualityControl());
        metaDataService.save(metaData);
        return ResponseEntity.ok(metaData);
    }

    @PostMapping("/save-column-info/{id}")
    public ResponseEntity<MetaData> saveColumn(@PathVariable("id") MetaData metaData,@RequestBody Column column) throws NotFoundException {
        metaDataService.saveColumn(metaData,column);
        return ResponseEntity.ok(metaData);
    }
}
