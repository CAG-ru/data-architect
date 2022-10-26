package pro.ach.data_architect.services.connectors.handler;

import java.io.File;
import java.util.List;

import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SaveMode;
import org.apache.spark.sql.SparkSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import liquibase.util.file.FilenameUtils;
import lombok.Data;
import lombok.extern.log4j.Log4j2;
import pro.ach.data_architect.dto.ParquetDto;
import pro.ach.data_architect.models.MetaData;
import pro.ach.data_architect.models.connection.Column;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.connection.Database;
import pro.ach.data_architect.models.connection.Schema;
import pro.ach.data_architect.models.connection.Table;
import pro.ach.data_architect.models.connection.enums.NestingLevel;
import pro.ach.data_architect.models.mart.Mart;
import pro.ach.data_architect.models.mart.TableData;
import pro.ach.data_architect.services.FileService;
import pro.ach.data_architect.services.MetaDataHelper;
import pro.ach.data_architect.services.ParquetService;

@Data
@Component
@Log4j2
public class CsvHandler implements DataSourceHanlerI {

  private ParquetService parquetService;
  private Connection connection;
  private FileService fileService;

  @Autowired
  public CsvHandler(ParquetService parquetService, FileService fileService) {
    this.parquetService = parquetService;
    this.fileService = fileService;
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public Database getDatabase(NestingLevel level) {
    Database database = new Database();
    SparkSession spark = parquetService.initSpark();
    Schema schema = new Schema();
    schema.setName(new File(connection.getFilePath()).getName());
    List<String> files = fileService.getFilesByMask(connection.getFilePath(), "*.csv");
    files.forEach(file -> {
      Dataset<Row> csv = spark.read().option("header", true).csv(file);
      Table table = new Table();
      table.setName(FilenameUtils.removeExtension(new File(file).getName()));
      table.setFilePath(file);
      csv.schema().foreach(columnType -> {
        Column column = new Column();
        column.setName(columnType.name());
        column.setType(columnType.dataType().typeName());
        column.setNullable(columnType.nullable());
        table.getColumns().add(column);
        return null;
      });
      schema.getTables().add(table);
      connection.getSchemasWithTables().add(table.getName());
    });
    database.getSchemas().add(schema);

    return database;
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public ParquetDto saveToParquet(MetaData metaData) {
    SparkSession spark = parquetService.initSpark();
    Dataset<Row> data = spark.read().option("header", true).csv(metaData.getFilePath());

    String filename = MetaDataHelper.generatePath(connection, metaData);
    ParquetDto parquetDto = new ParquetDto();
    parquetDto.setData(metaData);
    try {
      data.write().mode(SaveMode.Overwrite).option("maxRecordsPerFile", 10000).parquet(filename);
      parquetDto.setIsSuccess(true);
      parquetDto.setCount(data.count());
    } catch (Exception exception) {
      parquetDto.setIsSuccess(false);
      parquetDto.setCount(0L);
      log.error(exception.getMessage());
      log.error(exception.getStackTrace());
    }
    return parquetDto;
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public Connection getConnection() {
    return connection;
  }

  // ----------------------------------------------------------------------------------------------
  public void setConnection(Connection connection) {
    this.connection = connection;
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public void save(Mart mart) {

  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public void deleteTable(String name) {

  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<TableData> getDataByTable(Mart mart) {
    return null;
  }
}
