package pro.ach.data_architect.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pro.ach.data_architect.models.AuthUser;

public interface AuthUserRepository extends JpaRepository<AuthUser,Integer> {
    AuthUser findByUsername(String username);
}
