package pro.ach.data_architect.services.parser;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;

import lombok.extern.log4j.Log4j2;
import pro.ach.data_architect.models.Relation;
import pro.ach.data_architect.models.connection.Column;
import pro.ach.data_architect.models.connection.Database;
import pro.ach.data_architect.models.connection.Schema;
import pro.ach.data_architect.models.connection.Table;
import pro.ach.data_architect.models.connection.enums.NestingLevel;
import pro.ach.data_architect.services.Encoder;
import pro.ach.data_architect.services.MetaDataHelper;
import pro.ach.data_architect.services.ParquetService;
import pro.ach.data_architect.services.connectors.connection.DataSourceHelper;

@Log4j2
public class DataSourceParser {

    private Connection connection;
    private ParquetService parquetService;
    private Encoder encoder;

    public DataSourceParser(Connection connection, Encoder encoder) {
        this.connection = connection;
        this.encoder = encoder;
        parquetService = new ParquetService();
    }

    public List<String> getSchemas() {
        List<String> result = new ArrayList<>();
        try {
            DatabaseMetaData metaData = this.connection.getMetaData();
            ResultSet schemas = metaData.getSchemas();
            while (schemas.next()) {
                result.add(schemas.getString(1));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return result;
    }

    public List<String> getTableNames() {
        List<String> result = new ArrayList<>();
        try {
            DatabaseMetaData metaData = this.connection.getMetaData();
            String[] types = {"TABLE"};
            ResultSet tables = metaData.getTables(this.connection.getSchema(), this.connection.getSchema(), "%", types);
            while (tables.next()) {
                result.add(tables.getString("TABLE_NAME"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return result;
    }

    public List<Column> getColumnsByTable(Table table, 
            pro.ach.data_architect.models.connection.Connection connection, Schema schema) {
        List<Column> result = new ArrayList<>();
        SparkSession spark = parquetService.initSpark();
        Properties properties = new Properties();
        properties.setProperty("user", connection.getUsername());
        properties.setProperty("password", encoder.decode(connection.getPassword()));
        try {

            String tableName = MetaDataHelper.getTableName(schema,table);
            Dataset<Row> data = spark
                    .read()
                    .jdbc(DataSourceHelper.getDriverForDS(connection.getDbapi(), connection),
                            tableName,
                            properties);

            data.schema().foreach(columnType -> {
                Column column = new Column();
                column.setName(columnType.name());
                column.setType(columnType.dataType().typeName());
                column.setNullable(columnType.nullable());
                result.add(column);
                return null;
            });
        } catch (Exception e) {
            e.printStackTrace();
            log.error("connection failure with connection : {}, and table: {}", connection, table);
        }

        return result;
    }

    public List<Relation> getForeignKeys(Table table,Schema schema) {
        List<Relation> result = new ArrayList<>();
        try {
            DatabaseMetaData metaData = this.connection.getMetaData();
            ResultSet foreignKeys = metaData.getImportedKeys(null, schema.getName(), table.getName());
            while (foreignKeys.next()) {
                System.out.println("asdasd");
                Relation fKey = new Relation();
                fKey.setDestColumnName(foreignKeys.getString("FKCOLUMN_NAME"));
                fKey.setSourceColumnName(foreignKeys.getString("PKCOLUMN_NAME"));
                fKey.setDestMetaDataName(foreignKeys.getString("FKTABLE_NAME"));
                fKey.setSourceMetaDataName(foreignKeys.getString("PKTABLE_NAME"));
                fKey.setSourceMetaDataName(foreignKeys.getString("PKTABLE_NAME"));
                fKey.setDestSchema(schema.getName());
                fKey.setSourceSchema(schema.getName());
                result.add(fKey);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return result;
    }

    public List<Table> getTablesBySchema(Schema schema, 
            pro.ach.data_architect.models.connection.Connection con, NestingLevel level) throws SQLException {
        List<Table> result = new ArrayList<>();
        DatabaseMetaData metaData = this.connection.getMetaData();
        String[] types = {"TABLE"};
        ResultSet tables = metaData.getTables(connection.getCatalog(), schema.getName(), "%", types);
        while (tables.next()) {
            Table table = new Table();
            table.setName(tables.getString("TABLE_NAME"));
            if (level.getValue() > NestingLevel.TABLE.getValue()) {
                table.setColumns(this.getColumnsByTable(table, con, schema));
                table.setRelations(this.getForeignKeys(table,schema));
            }

            result.add(table);
        }
        return result;
    }

    public Database getSchema(pro.ach.data_architect.models.connection.Connection con, NestingLevel level) {
        Database database = new Database();
        try {
            DatabaseMetaData metaData = this.connection.getMetaData();
            database.setName(con.getDatabase());
            if (level.getValue() > NestingLevel.DATABASE.getValue()) {
                ResultSet schemas = metaData.getSchemas();
                if (schemas.first()) {
                    Schema sc = new Schema();
                    sc.setName(schemas.getString("TABLE_SCHEM"));
                    sc.setTables(getTablesBySchema(sc, con, level));
                    database.getSchemas().add(sc);
                    while (schemas.next()) {
                        Schema schema = new Schema();
                        schema.setName(schemas.getString("TABLE_SCHEM"));
                        schema.setTables(getTablesBySchema(schema, con, level));
                        database.getSchemas().add(schema);
                    }
                }else {
                    Schema schema = new Schema();
                    schema.setName(null);
                    schema.setTables(getTablesBySchema(schema, con, level));
                    database.getSchemas().add(schema);
                }

            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                connection.close();
            } catch (SQLException e) {
            }
        }
        return database;
    }


}
