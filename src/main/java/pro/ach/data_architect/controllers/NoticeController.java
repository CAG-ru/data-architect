package pro.ach.data_architect.controllers;

import java.security.Principal;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import pro.ach.data_architect.models.Notice;
import pro.ach.data_architect.services.AuthUserService;
import pro.ach.data_architect.services.NoticeService;

@Controller
@RequestMapping(value = "/notice")
public class NoticeController {
  private final NoticeService noticeService;
  private final AuthUserService authUserService;

  // ----------------------------------------------------------------------------------------------
  @Autowired
  public NoticeController(NoticeService noticeService, AuthUserService authUserService) {
    this.noticeService = noticeService;
    this.authUserService = authUserService;
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("/")
  public String index(Model model, Principal principal, @RequestParam(required = false) Integer page) {
    page = page == null ? 0 : page - 1;

    Page<Notice> pageNotices = noticeService.findByUserIdPageable(authUserService.findByUsername(principal.getName()).getId(), 
            PageRequest.of(page, 15, Sort.by("created").descending()));
    model.addAttribute("notices", pageNotices);
    return "notice/index";
  }

  // ----------------------------------------------------------------------------------------------
  @GetMapping("/get_notice_info")
  public ResponseEntity<List<Notice>> noiceInfo(HttpServletRequest request, Principal principal) {

    List<Notice> notViewedNotices = noticeService.findByUserIdAndViewed(authUserService.findByUsername(principal.getName()).getId(), false);

    notViewedNotices.forEach(notice -> {
      notice.setIsViewed(true);
      noticeService.save(notice);
    });
    return ResponseEntity.ok(notViewedNotices);
  }

}
