package pro.ach.data_architect.models.mart;

import java.util.Date;

import lombok.Data;

@Data
public class MartInfo {
    private String entityId;
    private String martColumnsCount;
    private String martDescription;
    private String martDestTable;
    private String martDestSchema;
    private Date martDueDate;
    private Boolean martForCheckQuality;
    private String martName;
    private String martPermanent;
    private Integer martRowsCount;
    private String martSubscribers;
    private String sourceDataRowsLimit;
    private Boolean isPublished;
    private Date publicationDate;
}
