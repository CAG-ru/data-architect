package pro.ach.data_architect.controllers;

import java.security.Principal;
import java.util.HashMap;
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

import pro.ach.data_architect.models.AuthUser;
import pro.ach.data_architect.services.AuthUserService;
import pro.ach.data_architect.services.SystemService;

@Controller
@RequestMapping(value = "/admin")
public class AdminController {

  private final AuthUserService authUserService;
  private final SystemService systemService;

  // ----------------------------------------------------------------------------------------------
  @Autowired
  public AdminController(AuthUserService authUserService, SystemService systemService) {
    this.authUserService = authUserService;
    this.systemService = systemService;
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("/")
  public String index(Model model, Principal principal) {

    model.addAttribute("users", authUserService.getAll());
    model.addAttribute("principal", authUserService.findByUsername(principal.getName()));
    return "admin/index";
  }

  // ************** User *******************

  // ----------------------------------------------------------------------------------------------
  /**
   * 
   * @param model
   * @param request
   * @return
   */
  @GetMapping("/edit/")
  public String edit(Model model, HttpServletRequest request) {
    String cid = request.getParameter("cid");
    Integer id = cid != null ? Integer.parseInt(cid) : null;
    String action = request.getParameter("action");

    model.addAttribute("user_id", id);
    if (action != null && action.equals("new")) {
      model.addAttribute("user", new AuthUser());
    } else {
      model.addAttribute("user", authUserService.findById(id));
    }
    return "admin/edit-user";
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("/delete/{id}")
  public String delete(@PathVariable("id") AuthUser user, Principal principal) {
    systemService.makeInfoNotice(principal, "Удаление пользователя: "+ user.getUsername());

    authUserService.delete(user);
    return "redirect:/admin/";
  }

  // ----------------------------------------------------------------------------------------------
  @PostMapping("/save")
  public ResponseEntity<AuthUser> save(@RequestBody AuthUser user, Principal principal) {
    systemService.makeInfoNotice(principal, String.format("Сохранение пользователя: '%s' ", user.getUsername()));
    return ResponseEntity.ok(authUserService.save(user, null));
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("/init-user-data")
  public ResponseEntity<Map<String, Object>> initUserData(HttpServletRequest request) {
    Map<String, Object> result = new HashMap<>();
    Integer id = 0;
    try {
      id = Integer.parseInt(request.getParameter("user_id"));
    } catch (NumberFormatException e) {
      id = 0;
    }

    result.put("user", authUserService.findById(id));
    return ResponseEntity.ok(result);
  }

}
