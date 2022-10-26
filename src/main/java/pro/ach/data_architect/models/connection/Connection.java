package pro.ach.data_architect.models.connection;

import java.util.Date;
import java.util.List;

import javax.persistence.Id;
import javax.persistence.Transient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.domain.Persistable;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.EqualsAndHashCode;
import pro.ach.data_architect.models.connection.enums.TypeConnection;
import pro.ach.data_architect.models.connection.enums.TypeDatabase;
import pro.ach.data_architect.models.connection.enums.TypeFiles;
import pro.ach.data_architect.models.connection.enums.TypeSource;
import pro.ach.data_architect.services.MetaDataService;

@Data
@Document
@EqualsAndHashCode
public class Connection implements Persistable<String> {
  @Id
  private String id;

  private TypeConnection typeConnection;
  private TypeSource typeSource;
  private String name;
  private String description;
  private String shortDescription;
  // private String dataSetCode;
  
  private String originalUrl;
  private String internalIdentifier;
  private String regulatoryDocuments;
  private String dataOwner;
  private String dataOperator;
  private String relationToTheDataLifecycle;
  
  
  private Integer versionsCountForLoad;
  private TypeDatabase dbapi;
  private String database;
  private String host;
  private Integer port;
  private Integer threads;
  private Integer chunks;
  private Integer limLobSize;
  private List<String> schemasWithTables;
  // private String connectionsCollection;
  // private String metadataCollection;
  // private String mongodbCollection;
  // private String mongodbFileSrc;
  // private String martsCollection;
  private String typeAnyFilesSource;
  private TypeFiles fileType;
  private String filePath;
  private String fileSchema;
  private String csvDelimiter;
  private String csvQuotechar;
  private String destPath;
  // private String metaTypesCollection;
  // private String relationsCollection;
  private String useCredentials;
  private String username;

  private String password;
  private String sslCaCerts;
  private String schema;
  private String schemaTmpTables;
  private String schemaQualityCheckTables;
  private String schemaHandbooksTables;
  private String handbookDocTypes;
  private String csvFilePath;

  private Boolean createCsvFile;
  private Boolean filesNeedScanSubdirs;
  private Date lastVersion = new Date(0);

  // ! TODO: Эти поля зачем нужны???
  // private List<String> listVersions = new ArrayList<>();

  // ! TODO: Зачем? Надо убрать отсюда. 
  private RelationInfo relationInfo;

  @Transient
  public String getTypeSourceHuman() {
    return typeSource.getTitle();
  }

  @Transient
  public String getDbapiHuman() {
    return dbapi.getTitle();
  }

  @Transient
  public String getTypeFilesHuman() {
    return fileType.getTitle();
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
    return createdAt == null;
  }
}
