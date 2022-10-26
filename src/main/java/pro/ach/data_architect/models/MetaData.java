package pro.ach.data_architect.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.querydsl.core.annotations.QueryEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import pro.ach.data_architect.models.connection.Column;

import javax.persistence.Id;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@Data
@Document
@QueryEntity
@EqualsAndHashCode
public class MetaData{
    @Id
    private String id;
    private String connectId;
    private String name;
    private String schema;
    private String filePath;
    @JsonFormat(pattern="yyyy-MM-dd")
    private Date version;
    private String destPath;
    private String jobsPath;
    private String comment;
    private String description;
    private Boolean needQualityControl;
    private Integer chunks;
    private Long rows;
    private List<Column> columns=new ArrayList<>();
    @CreatedDate
    private Date createdAt;
    @LastModifiedDate
    private Date updatedAt;
    @CreatedBy
    private String createdBy;
    @LastModifiedBy
    private String updatedBy;
}
