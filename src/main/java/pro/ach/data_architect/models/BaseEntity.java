package pro.ach.data_architect.models;

import lombok.Data;

import javax.persistence.*;

@MappedSuperclass
@Data
public class BaseEntity {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)    // @GeneratedValue(strategy = GenerationType.AUTO)
    protected Integer id;
}
