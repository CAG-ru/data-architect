package pro.ach.data_architect.models;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.Table;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Table(name = "notices", schema = "public")
@Data
@Entity
@EqualsAndHashCode(callSuper = false)
public class Notice extends BaseEntity{
  private Integer userId;
  private String message;
  private Boolean isViewed;
  private Date created;
  private String kind;
}
