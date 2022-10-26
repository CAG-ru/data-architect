package pro.ach.data_architect.services.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import pro.ach.data_architect.models.AuthUser;
import pro.ach.data_architect.services.AuthUserService;

@Service
public class SecurityService implements UserDetailsService {
    private final AuthUserService userService;

    @Autowired
    public SecurityService(AuthUserService userService) {
        this.userService = userService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AuthUser user = userService.findByUsername(username);

        if(user == null){
            throw  new UsernameNotFoundException(String.format("user with username %s not found",username));
        }

       return SecurityUser.fromUser(user);
    }
}
