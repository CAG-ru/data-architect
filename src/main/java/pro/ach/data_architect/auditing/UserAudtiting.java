package pro.ach.data_architect.auditing;


import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserAudtiting implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        System.out.println(SecurityContextHolder.getContext());
        return Optional.of(SecurityContextHolder.getContext().getAuthentication().getName());
    }
}
