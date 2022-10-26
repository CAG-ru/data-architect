package pro.ach.data_architect.services;

import pro.ach.data_architect.models.Group;
import pro.ach.data_architect.models.AuthUser;

import java.util.List;

/**
 * Интерфес для общения с таблицей пользователей
 *
 * @author ACH
 */

public interface AuthUserService {
    AuthUser regiser(AuthUser user, List<Group> groups);

    List<AuthUser> getAll();

    AuthUser findById(Integer id);

    AuthUser findByUsername(String name);

    void delete(AuthUser user);

    AuthUser save(AuthUser user, List<Group> groups);
}
