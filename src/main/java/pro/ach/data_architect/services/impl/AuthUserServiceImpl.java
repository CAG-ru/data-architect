package pro.ach.data_architect.services.impl;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import pro.ach.data_architect.models.AuthUser;
import pro.ach.data_architect.models.Group;
import pro.ach.data_architect.repositories.AuthUserRepository;
import pro.ach.data_architect.services.AuthUserService;

/**
 * Имплементация интерфеса для общения с таблицей пользователей
 *
 * @author ACH
 */

@Service
public class AuthUserServiceImpl implements AuthUserService {

    private final AuthUserRepository userRepository;

    @Autowired
    public AuthUserServiceImpl(AuthUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    protected PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Override
    public AuthUser regiser(AuthUser user, List<Group> groups) {
        user.setGroups(groups);
        userRepository.save(user);
        return user;
    }

    @Override
    public List<AuthUser> getAll() {
        return userRepository.findAll();
        // return null;
    }

    @Override
    public AuthUser findById(Integer id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public AuthUser findByUsername(String name) {
        return userRepository.findByUsername(name);
    }

    @Override
    public void delete(AuthUser user) {
        this.userRepository.delete(user);

    }

    @Override
    public AuthUser save(AuthUser user, List<Group> groups) {
        if (user.getDateJoined() == null) {
            user.setDateJoined(new Date());
        }

        AuthUser savedUser = this.findByUsername(user.getUsername());

        if (savedUser==null || !savedUser.getPassword().equals(user.getPassword())) {
            user.setPassword(this.passwordEncoder().encode(user.getPassword()));
        }
        user.setGroups(groups);
        userRepository.save(user);
        return user;
    }
}
