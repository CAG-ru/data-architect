package pro.ach.data_architect.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import pro.ach.data_architect.models.handbook.HandBook;
import pro.ach.data_architect.services.HandBookService;

@Controller
@RequestMapping(value = "/handbooks")
public class HandBookController {

    private HandBookService handBookService;

    public HandBookController(HandBookService handBookService) {
        this.handBookService = handBookService;
    }

    @GetMapping("/")
    public String index(){
        return "handbooks/index";
    }

    @GetMapping("get-by-type/{type}")
    public ResponseEntity getHandBooksByType(@PathVariable String type){
        Map<String,Object> result=new HashMap<>();
        result.put("handbooks",handBookService.findByType(type));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/save")
    public ResponseEntity getHandBooksByType(@RequestBody HandBook handBook){
        return ResponseEntity.ok(handBookService.save(handBook));
    }
}
