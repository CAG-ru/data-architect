package pro.ach.data_architect.models.mart;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.persistence.Id;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.domain.Persistable;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import pro.ach.data_architect.models.Entity;

@Document
@Data
public class Mart implements Persistable<String> {
    @Id
    private String id;
    private String name;
    private Boolean checkForQuality;
    private String destTable;
    private Integer subscribers;
    private Integer priority;
    private Boolean isPermanent;
    private Date dueDate;
    private Date createdTableAt;
    private MartInfo martInfo;
    private MartGraph martGraph;
    private MartAdditional martAdditional;
    private Entity entity;
    private List<Filter> martFilters = new ArrayList<>();
    private NodeMart node;

    public List<Filter> getFiltersForNode(NodeMart node) {
        return martFilters.stream()
                .filter(filter -> filter.getMetadataId().equals(node.getId()))
                .collect(Collectors.toList());
    }

    @CreatedDate
    private Date createdAt;
    @LastModifiedDate
    private Date updatedAt;
    @CreatedBy
    private String createdBy;
    @LastModifiedBy
    private String updatedBy;

    @Override
    public boolean isNew() {
        return createdAt==null;
    }
}
