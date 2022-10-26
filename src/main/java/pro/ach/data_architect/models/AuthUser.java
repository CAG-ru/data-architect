package pro.ach.data_architect.models;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Table(name = "auth_user", schema = "public")
@Data
@Entity
@EqualsAndHashCode(callSuper = false)
public class AuthUser extends BaseEntity {
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private Boolean isStaff;
    private Boolean isActive;
    private Boolean isSuperuser;
    private String  password;
    private Date dateJoined;
    private Date lastLogin;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "auth_user_groups",
    joinColumns = {@JoinColumn(name = "user_id",referencedColumnName = "id")},
        inverseJoinColumns = {@JoinColumn(name = "group_id",referencedColumnName = "id")}
    )
    private List<Group> groups;

    public Set<SimpleGrantedAuthority> getAuthorities(){
        Set<SimpleGrantedAuthority> result =  new HashSet<>();
        return  result;
    }
}
