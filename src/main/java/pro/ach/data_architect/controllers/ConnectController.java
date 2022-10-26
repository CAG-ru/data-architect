package pro.ach.data_architect.controllers;

import java.security.Principal;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import pro.ach.data_architect.models.DataStore;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.connection.enums.NestingLevel;
import pro.ach.data_architect.models.connection.enums.TypeConnection;
import pro.ach.data_architect.services.ConnectService;
import pro.ach.data_architect.services.DataStoreService;
import pro.ach.data_architect.services.Encoder;
import pro.ach.data_architect.services.MetaDataService;
import pro.ach.data_architect.services.RelationService;
import pro.ach.data_architect.services.SystemService;
import pro.ach.data_architect.services.connectors.connection.JdbcConnector;
import pro.ach.data_architect.services.connectors.handler.HandlerHelper;
import pro.ach.data_architect.services.parser.DataSourceParser;

@Controller
@RequestMapping(value = "/connects")
public class ConnectController {

  private final ConnectService connectService;
  private final DataStoreService dataStoreService;
  private final JdbcConnector jdbcConnector;
  private final MetaDataService metaDataService;
  private final HandlerHelper handlerHelper;
  private final Encoder encoder;
  private final SystemService systemService;
  private final RelationService relationService;

  @Autowired
  public ConnectController(ConnectService connectService, DataStoreService dataStoreService,
      JdbcConnector jdbcConnector, MetaDataService metaDataService, HandlerHelper handlerHelper, Encoder encoder,
      SystemService systemService, RelationService relationService) {
    this.connectService = connectService;
    this.dataStoreService = dataStoreService;
    this.jdbcConnector = jdbcConnector;
    this.metaDataService = metaDataService;
    this.handlerHelper = handlerHelper;
    this.encoder = encoder;
    this.systemService = systemService;
    this.relationService = relationService;
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("/")
  public String index(Model model) {
    List<Connection> connections = connectService.findByTypeConnection(TypeConnection.MARTS);
    List<DataStore> dataStores = dataStoreService.getAll();
    model.addAttribute("mart_con", connections.size() > 0 ? connections.get(0) : null);
    model.addAttribute("data_con", dataStores.size() > 0 ? dataStores.get(0) : null);
    return "connects/index";
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("edit-mart-connection")
  public String detail() {
    return "connects/marts/mart_edit_connection";
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("find-by-type-connection/{connectionType}")
  public ResponseEntity findByConnectionType(@PathVariable TypeConnection connectionType) {
    return ResponseEntity.ok(connectService.findByTypeConnection(connectionType));
  }

  // ----------------------------------------------------------------------------------------------
  @PostMapping("test-connection")
  public ResponseEntity testConnection(@RequestBody Connection connection, HttpServletRequest request)
      throws SQLException {
    Map<String, Object> response = new HashMap<>();
    Boolean withTableStructure = (Boolean) request.getAttribute("with-table-structure");

    if (connection.getPassword().equals("") && !connection.getId().equals("") && connection.getId() != null) {
      Connection sourceConnection = connectService.findById(connection.getId());
      connection.setPassword(sourceConnection.getPassword());
    } else {
      connection.setPassword(encoder.encode(connection.getPassword()));
    }
    java.sql.Connection connect = jdbcConnector.connect(connection);
    response.put("result", true);
    response.put("schemas", new DataSourceParser(connect, encoder).getSchemas());
    response.put("schemas_with_tables",
        new DataSourceParser(connect, encoder).getSchema(connection, NestingLevel.TABLE));

    return ResponseEntity.ok(response);
  }

  // ----------------------------------------------------------------------------------------------
  @PostMapping("save")
  public ResponseEntity<Map<String, Boolean>> save(@RequestBody Connection connection, Principal principal) {
    if (connection.getPassword() != null && !connection.getPassword().equals("")) {
      connection.setPassword(encoder.encode(connection.getPassword()));
    } else {
      connection.setPassword(null);
    }
    connectService.save(connection);
    Map<String, Boolean> result = new HashMap<>();

    systemService.makeInfoNotice(principal, "Сохранение соединения с базой витрин данных ");
    result.put("result", true);
    return ResponseEntity.ok(result);
  }
}
