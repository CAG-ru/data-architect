package pro.ach.data_architect.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import pro.ach.data_architect.services.AuthUserService;

@Controller
@RequestMapping("/auth")
public class AuthController {
    private AuthenticationManager authenticationManager;
    private final AuthUserService userService;

    @Autowired
    public AuthController(AuthUserService userService) {
        this.userService = userService;
    }


    @GetMapping("/login")
    public String login(){
        return "registration/login";
    }

}
