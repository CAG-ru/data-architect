package pro.ach.data_architect.models;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.domain.Persistable;
import org.springframework.data.mongodb.core.mapping.Document;
import pro.ach.data_architect.models.connection.Connection;

import javax.persistence.Id;
import java.util.Date;

@Data
@Document
@EqualsAndHashCode
public class Relation implements Persistable<String> {
    @Id
    private String id;
    private String sourceConnectionId;
    private String sourceSchema;
    private String sourceMetaDataName;
    private String sourceMetaDataId;
    private String sourceColumnName;
    private String destConnectionId;
    private String destMetaDataName;
    private String destMetaDataId;
    private String destSchema;
    private String destColumnName;
    private String relationType;
    private Boolean isConfirmed=false;
    @CreatedDate
    private Date createdAt;
    @LastModifiedDate
    private Date updatedAt;
    @CreatedBy
    private String createdBy;
    @LastModifiedBy
    private String updatedBy;

    public Boolean hasConnection(String id) {
        return getSourceConnectionId().equals(id) || getDestConnectionId().equals(id);
    }

    public Boolean hasConnection(Connection connection) {
        return hasConnection(connection.getId());
    }

    public String getOpportunityConnectionId(String id) {
        return id.equals(getSourceConnectionId())? getDestConnectionId():getSourceConnectionId();
    }

    @Override
    public boolean isNew() {
        return createdAt==null;
    }
}
