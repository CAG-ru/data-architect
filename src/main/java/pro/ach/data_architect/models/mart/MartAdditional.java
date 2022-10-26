package pro.ach.data_architect.models.mart;

import java.util.List;

import lombok.Data;

@Data
public class MartAdditional {
    private String accessMode;
    private String action;
    private String aggregationLevel;
    private String apiUrl;
    private String doiTag;
    private String forCitations;
    private String fullDescription;
    private String handbooksAndClassifiers;
    private String internalDataSetIdentifier;
    private String licence;
    private String linkToDatasetDescription;
    private String priority;
    private String publicationDate;
    private String published;
    private String regularityOfDataSetUpdate;
    private String setCategories;
    private String shortDescription;
    private List<String> tags;
    private String theEssenceOfDataEmergence;
}
