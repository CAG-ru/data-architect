package pro.ach.data_architect.services.connectors.handler;

import java.util.List;

import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SaveMode;
import org.apache.spark.sql.SparkSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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
import pro.ach.data_architect.services.ParquetService;

@Data
@Component
@Log4j2
public class XmlHandler implements DataSourceHanlerI {

    private ParquetService parquetService;
    private Connection connection;
    private FileService fileService;


    @Autowired
    public XmlHandler(ParquetService parquetService, FileService fileService) {
        this.parquetService = parquetService;
        this.fileService = fileService;
    }

    @Override
    public Database getDatabase(NestingLevel level) {
        Database database = new Database();
        SparkSession spark = parquetService.initSpark();
        Schema schema = new Schema();
        schema.setName("public");
        database.getSchemas().add(schema);
        List<String> files = fileService.getFilesByMask(connection.getFilePath(), "*.csv");
        files.forEach(file -> {
            Dataset<Row> csv = spark.read()
                    .option("header", true)
                    .csv(file);
            Table table = new Table();
            table.setName(file);
            csv.schema().foreach(columnType -> {
                Column column = new Column();
                column.setName(columnType.name());
                column.setType(columnType.dataType().typeName());
                table.getColumns().add(column);
                return null;
            });
            schema.getTables().add(table);
            connection.getSchemasWithTables().add(table.getName());
        });


        return database;
    }

    @Override
    public ParquetDto saveToParquet(MetaData metaData) {
        SparkSession spark = parquetService.initSpark();
        Dataset<Row> data = spark
                .read()
                .option("header", true)
                .csv(metaData.getName());
        String filename = String.format("%s/%s/%s", connection.getDestPath(), connection.getLastVersion().getTime(), metaData.getName());

        try{
            data.write()
                    .mode(SaveMode.Overwrite)
                    .option("maxRecordsPerFile", 10000)
                    .parquet(filename);
        } catch (Exception exception) {
            log.error(exception.getMessage());
            log.error(exception.getStackTrace());
            return new ParquetDto();
        }


        return new ParquetDto();
    }

    @Override
    public Connection getConnection() {
        return connection;
    }

    public void setConnection(Connection connection) {
        this.connection = connection;
    }

    @Override
    public void save(Mart mart) {

    }

    @Override
    public void deleteTable(String name) {

    }

    @Override
    public List<TableData> getDataByTable(Mart mart) {
        return null;
    }
}
