package pro.ach.data_architect.services.security;

import java.util.Collection;
import java.util.Date;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import pro.ach.data_architect.models.AuthUser;

public class SecurityUser implements UserDetails {

    private final Integer id;
    private final String username;
    private final String firstName;
    private final String lastName;
    private final String password;
    private final String email;
    private final Boolean enabled;
    private final Date lastPasswordResetDate;
    private final Collection<? extends GrantedAuthority> authorities;

    public SecurityUser(Integer id,
                        String username,
                        String firstName,
                        String lastName,
                        String password,
                        String email,
                        Boolean enabled,
                        Date lastPasswordResetDate,
                        Collection<? extends GrantedAuthority> authorities
    ) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.email = email;
        this.enabled = enabled;
        this.lastPasswordResetDate = lastPasswordResetDate;
        this.authorities = authorities;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return isEnabled();
    }

    @Override
    public boolean isAccountNonLocked() {
        return isEnabled();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return isEnabled();
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    public static UserDetails fromUser(AuthUser user){
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            user.getIsActive(),
            user.getIsActive(),
            user.getIsActive(),
            user.getIsActive(),
                user.getAuthorities()
            );
    }
}
