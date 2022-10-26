package pro.ach.data_architect.controllers;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
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

import pro.ach.data_architect.models.Entity;
import pro.ach.data_architect.services.ConnectService;
import pro.ach.data_architect.services.EntityService;
import pro.ach.data_architect.services.MetaDataService;

@Controller
@RequestMapping(value = "/entities")
public class EntityController {

  private EntityService entityService;
  private ConnectService connectService;
  private MetaDataService metaDataService;

  @Autowired
  public EntityController(EntityService entityService, ConnectService connectService, MetaDataService metaDataService) {
    this.entityService = entityService;
    this.connectService = connectService;
    this.metaDataService = metaDataService;
  }

  @GetMapping("/")
  public String index(Model model, @RequestParam(required = false) Integer page) {
    page = page == null ? 0 : page - 1;
    model.addAttribute("entities", entityService.getAll(PageRequest.of(page, 10)));
    return "entities/index";
  }

  @GetMapping("/edit-entity/")
  public String edit(Model model, HttpServletRequest request) {
    String id = request.getParameter("cid");
    model.addAttribute("entity_id", id);
    if (id != null) {
      model.addAttribute("entity", entityService.findById(id));
    }
    return "entities/edit_entity";
  }

  @GetMapping("/init-entity-data")
  public ResponseEntity initEntityData(HttpServletRequest request) {
    Map<String, Object> result = new HashMap<>();
    String entity_id = request.getParameter("entity_id");
    result.put("connects_list", connectService.getLoadedSourceConnections());
    if (entity_id.length()!=0) {
      result.put("entity", entityService.findById(entity_id));
    }
    return ResponseEntity.ok(result);
  }

  @PostMapping("/save")
  public ResponseEntity save(@RequestBody Entity entity) {
    return ResponseEntity.ok(entityService.save(entity));
  }

  @GetMapping("/delete/{id}")
  public String delete(@PathVariable("id") Entity entity) {
    entityService.delete(entity);
    return "redirect:/entities/";
  }
}
