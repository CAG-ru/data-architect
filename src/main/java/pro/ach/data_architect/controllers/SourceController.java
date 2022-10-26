package pro.ach.data_architect.controllers;

import java.security.Principal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.view.RedirectView;

import javassist.NotFoundException;
import pro.ach.data_architect.exceptions.classes.DataStoreNotFoundException;
import pro.ach.data_architect.models.AuthUser;
import pro.ach.data_architect.models.DataStore;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.connection.enums.NestingLevel;
import pro.ach.data_architect.models.connection.enums.TypeConnection;
import pro.ach.data_architect.models.connection.enums.TypeDatabase;
import pro.ach.data_architect.models.connection.enums.TypeFiles;
import pro.ach.data_architect.models.connection.enums.TypeSource;
import pro.ach.data_architect.services.AuthUserService;
import pro.ach.data_architect.services.ConnectService;
import pro.ach.data_architect.services.DataStoreService;
import pro.ach.data_architect.services.Encoder;
import pro.ach.data_architect.services.MetaDataService;
import pro.ach.data_architect.services.RelationService;
import pro.ach.data_architect.services.SystemService;
import pro.ach.data_architect.services.connectors.connection.JdbcConnector;
import pro.ach.data_architect.services.connectors.handler.DataSourceHanlerI;
import pro.ach.data_architect.services.connectors.handler.HandlerHelper;
import pro.ach.data_architect.services.parser.DataSourceParser;

@Controller
@RequestMapping(value = "/sources")
public class SourceController {

  private final ConnectService connectService;
  private final DataStoreService dataStoreService;
  private final JdbcConnector jdbcConnector;
  private final MetaDataService metaDataService;
  private final HandlerHelper handlerHelper;
  private final Encoder encoder;
  private final SystemService systemService;
  private final RelationService relationService;
  private final AuthUserService authUserService;

  @Autowired
  public SourceController(ConnectService connectService, DataStoreService dataStoreService, JdbcConnector jdbcConnector,
      MetaDataService metaDataService, HandlerHelper handlerHelper, Encoder encoder, SystemService systemService,
      RelationService relationService, AuthUserService authUserService) {
    this.connectService = connectService;
    this.dataStoreService = dataStoreService;
    this.jdbcConnector = jdbcConnector;
    this.metaDataService = metaDataService;
    this.handlerHelper = handlerHelper;
    this.encoder = encoder;
    this.systemService = systemService;
    this.relationService = relationService;
    this.authUserService = authUserService;
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("/")
  public String index(Model model) {
    List<Connection> connections = connectService.findByTypeConnection(TypeConnection.MARTS);
    List<DataStore> dataStores = dataStoreService.getAll();
    model.addAttribute("mart_con", connections.size() > 0 ? connections.get(0) : null);
    model.addAttribute("data_con", dataStores.size() > 0 ? dataStores.get(0) : null);
    model.addAttribute("disk_free_space", systemService.getDiskFree());
    model.addAttribute("memory_free_space", systemService.getMemoryFree());
    return "sources/index";
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("edit-source-conn/")
  public String editSource(HttpServletRequest request, Model model) {
    model.addAttribute("edit_connect_id", request.getParameter("cid"));
    return "sources/edit_source_conn";
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("get-connection-data")
  public ResponseEntity<Map<String, Object>> getConnectionData(HttpServletRequest request) {
    Map<String, Object> result = new HashMap<>();
    result.put("TYPES_DATABASES", TypeDatabase.asMap());
    result.put("TYPES_FILES", TypeFiles.asMap());
    result.put("TYPES_SOURCE", TypeSource.asMap());
    result.put("TYPES_ANY_FILES_SOURCE", new ArrayList<>());
    result.put("type_of_data_source", new ArrayList<>());
    result.put("relation_to_the_data_lifecycle", new ArrayList<>());
    Connection connection = null;
    if (request.getParameter("conn_id") != null) {
      connection = connectService.findById(request.getParameter("conn_id"));
    }
    result.put("connection", connection);

    return ResponseEntity.ok(result);
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("init-list-source-connections")
  public ResponseEntity<Map<String, Object>> getConnectionSourcesInitData(Principal principal) {
    Map<String, Object> result = new HashMap<>();
    // TODO убрать
    result.put("QUALITY_CONTROL_STATUS", new ArrayList<>());
    // TODO убрать
    result.put("TYPES_ANY_FILES_SOURCE", new ArrayList<>());

    result.put("TYPES_CONNECTON", TypeConnection.asMap());
    result.put("TYPES_DATABASES", TypeDatabase.asMap());
    result.put("TYPES_FILES", TypeFiles.asMap());
    result.put("TYPES_SOURCE", TypeSource.asMap());
    result.put("metadatas", metaDataService.getAll());
    result.put("source_connections", connectService.findByTypeConnection(TypeConnection.SOURCE));
    result.put("type_of_data_source", new ArrayList<>());
    result.put("relation_to_the_data_lifecycle", new ArrayList<>());
    AuthUser authUser = authUserService.findByUsername(principal.getName());
    result.put("user", authUser.getUsername());
    result.put("user_is_staff", authUser.getIsStaff());
    return ResponseEntity.ok(result);
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("find-by-id/{id}")
  public ResponseEntity<Map<String, Object>> findById(@PathVariable String id) {
    Map<String, Object> result = new HashMap<>();
    result.put("source_conn", connectService.findById(id));
    result.put("DIGITAL_PLATFORM_INTEGRATION", false);
    result.put("user_is_staff", true);
    return ResponseEntity.ok(result);
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

    systemService.makeInfoNotice(principal,
        String.format("Сохранение соединения с источником: '%s' ", connection.getName()));
    result.put("result", true);
    return ResponseEntity.ok(result);
  }

  // ----------------------------------------------------------------------------------------------
  @Transactional
  @GetMapping("load-data/{connectionId}")
  public ResponseEntity loadDataFromCsv(@PathVariable String connectionId, Principal principal)
      throws SQLException, DataStoreNotFoundException, InterruptedException {
    Connection connection = this.connectService.findById(connectionId);
    if (connection == null) {
      return ResponseEntity.ok("Connection not found");
    }
    DataSourceHanlerI handler = handlerHelper.getHandler(connection);
    handler.setConnection(connection);
    systemService.makeInfoNotice(principal,
        String.format("Загрузка данных соединения с источником: '%s' ", connection.getName()));

    connectService.loadData(handler);
    return ResponseEntity.ok("qwe");
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("make-relations/{id}")
  public String loadDataFromCsv(@PathVariable("id") Connection connection, Principal principal) throws SQLException {
    systemService.makeInfoNotice(principal,
        String.format("Обработка связей для соединения с источником: '%s' ", connection.getName()));
    connectService.loadRelationsForConnection(connection);
    return "redirect:/sources/";
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("/clear/{connectionId}")
  public RedirectView clear(@PathVariable String connectionId, Principal principal) throws NotFoundException {
    Connection connection = this.connectService.findById(connectionId);
    systemService.makeInfoNotice(principal,
        String.format("Очистка соединения с источником: '%s' ", connection.getName()));
    connectService.clear(connectionId);
    return new RedirectView("/sources/");
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("/delete/{connectionId}")
  public RedirectView delete(@PathVariable String connectionId, Principal principal) throws NotFoundException {
    Connection connection = this.connectService.findById(connectionId);
    systemService.makeInfoNotice(principal,
        String.format("Удаление соединения с источником: '%s' ", connection.getName()));
    connectService.delete(connectionId);
    return new RedirectView("/sources/");
  }
}
