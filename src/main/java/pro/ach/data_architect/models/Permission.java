package pro.ach.data_architect.models;

import java.util.List;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode
public class Permission extends BaseEntity {
  private String name;
  private Long contentTypeId;
  private String codename;

  List<Group> groups;
}
