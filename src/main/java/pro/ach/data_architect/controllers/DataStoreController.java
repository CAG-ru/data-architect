package pro.ach.data_architect.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.view.RedirectView;

import pro.ach.data_architect.models.DataStore;
import pro.ach.data_architect.services.DataStoreService;
import pro.ach.data_architect.services.connectors.connection.JdbcConnector;

@Controller
@RequestMapping(value = "/data-store")
public class DataStoreController {

    private DataStoreService dataStoreService;

    @Autowired
    public DataStoreController(DataStoreService dataStoreService, JdbcConnector jdbcConnector) {
        this.dataStoreService = dataStoreService;
    }


    @GetMapping("edit-data-connection")
    public String detail(Model model) {
        model.addAttribute("form", dataStoreService.getMainStore());
        return "connects/datas/data_edit_connection";
    }

    @GetMapping("find-by-id/{id}")
    public ResponseEntity findByConnectionType(@PathVariable String id) {
        return ResponseEntity.ok(dataStoreService.findById(id));
    }

    @PostMapping( "save")
    public RedirectView save(DataStore dataStore) {
        dataStoreService.save(dataStore);
        Map<String, Boolean> result = new HashMap<>();
        result.put("result", true);
        return new RedirectView("/connects/");
    }

}
