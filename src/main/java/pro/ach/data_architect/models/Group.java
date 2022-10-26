package pro.ach.data_architect.models;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import javax.persistence.Entity;
import java.util.List;

@Table(name = "auth_group")
@Data
@Entity
@EqualsAndHashCode
public class Group extends BaseEntity {
    private String name;

    @ManyToMany(mappedBy = "groups",fetch = FetchType.LAZY)
    private List<AuthUser> users;
}
