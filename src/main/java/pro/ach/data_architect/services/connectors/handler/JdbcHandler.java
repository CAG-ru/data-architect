package pro.ach.data_architect.services.connectors.handler;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

import org.apache.spark.sql.Column;
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
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.connection.Database;
import pro.ach.data_architect.models.connection.enums.NestingLevel;
import pro.ach.data_architect.models.mart.Filter;
import pro.ach.data_architect.models.mart.Mart;
import pro.ach.data_architect.models.mart.NodeMart;
import pro.ach.data_architect.models.mart.Relate;
import pro.ach.data_architect.models.mart.TableData;
import pro.ach.data_architect.services.Encoder;
import pro.ach.data_architect.services.MetaDataHelper;
import pro.ach.data_architect.services.ParquetService;
import pro.ach.data_architect.services.connectors.connection.DataSourceHelper;
import pro.ach.data_architect.services.connectors.connection.JdbcConnector;
import pro.ach.data_architect.services.parser.DataSourceParser;

@Data
@Component
@Log4j2
public class JdbcHandler implements DataSourceHanlerI {

    private JdbcConnector jdbcConnector;
    private ParquetService parquetService;
    private Connection connection;
    private Encoder encoder;


    @Autowired
    public JdbcHandler(JdbcConnector jdbcConnector, ParquetService parquetService, Encoder encoder) {
        this.jdbcConnector = jdbcConnector;
        this.parquetService = parquetService;
        this.encoder = encoder;

    }

    @Override
    public Database getDatabase(NestingLevel level) throws SQLException {
        java.sql.Connection dbconnection = this.jdbcConnector.connect(connection);
        Database database = new DataSourceParser(dbconnection, encoder).getSchema(connection, level);
        return database;
    }

    @Override
    public ParquetDto saveToParquet(MetaData metaData) {
        SparkSession spark = parquetService.initSpark();
        Properties properties = new Properties();
        properties.setProperty("user", connection.getUsername());
        properties.setProperty("password", encoder.decode(connection.getPassword()));
        Dataset<Row> data = spark
                .read()
                .jdbc(DataSourceHelper.getDriverForDS(connection.getDbapi(), connection),
                        MetaDataHelper.getTableName(metaData),
                        properties);
        String filename = MetaDataHelper.generatePath(connection, metaData);
        ParquetDto parquetDto=new ParquetDto();
        parquetDto.setData(metaData);
        try {
            data.write()
                    .mode(SaveMode.Overwrite)
                    .option("maxRecordsPerFile", 10000)
                    .parquet(filename);

            parquetDto.setIsSuccess(true);
            parquetDto.setCount(data.count());
        } catch (Exception exception) {
            exception.printStackTrace();
            parquetDto.setIsSuccess(false);
            return parquetDto;
        }

        return parquetDto;


    }

    @Override
    public Connection getConnection() {
        return connection;
    }

    public void setConnection(Connection connection) {
        this.connection = connection;
    }


    private Dataset<Row> renameColumn(Dataset<Row> data, NodeMart node) {
        for (String column : node.getSelectedColumns()) {
            data = data.withColumnRenamed(column, node.getId() + "_" + column);

        }

        return data;
    }

    private org.apache.spark.sql.Column[] convertStringToColumns(String[] columns) {
        return Arrays.stream(columns)
                .map(Column::new)
                .toArray(org.apache.spark.sql.Column[]::new);
    }

    public Dataset<Row> join(NodeMart node, Dataset<Row> data) {
        SparkSession spark = parquetService.initSpark();

        for (Relate relate : node.getRelates()) {
            if (relate.getNode().getSelectedColumns().length > 0) {
                Dataset<Row> data1 = spark
                        .read()
                        .parquet(relate.getNode().getDestPath())
                        .select(convertStringToColumns(relate.getNode().getSelectedColumns()));

                data1 = prepareFilters(data1, relate.getNode());

                data1 = renameColumn(data1, relate.getNode());
                String dataJoin;
                String dataJoin1;
                if (relate.getEdge().getTargetData().getMetadataId().equals(node.getId())) {
                    dataJoin = String.format(
                            "%s_%s",
                            relate.getEdge().getTargetData().getMetadataId(),
                            relate.getEdge().getTargetData().getColumnName()
                    );
                    dataJoin1 = String.format(
                            "%s_%s",
                            relate.getEdge().getSourceData().getMetadataId(),
                            relate.getEdge().getSourceData().getColumnName()
                    );
                } else {
                    dataJoin1 = String.format(
                            "%s_%s",
                            relate.getEdge().getTargetData().getMetadataId(),
                            relate.getEdge().getTargetData().getColumnName()
                    );
                    dataJoin = String.format(
                            "%s_%s",
                            relate.getEdge().getSourceData().getMetadataId(),
                            relate.getEdge().getSourceData().getColumnName()
                    );
                }

                data = data.join(
                        data1,
                        data.col(dataJoin)
                                .equalTo(data1.col(dataJoin1))
                );
                data = join(relate.getNode(), data);
            }
        }

        return data;
    }

    public Dataset<Row> prepareFilters(Dataset<Row> data, NodeMart node) {
        for (Filter filter : node.getFilters()) {
            data = data.where(
                    String.format(
                            "%s %s %s",
                            filter.getColumnName(),
                            filter.getConditionType(),
                            filter.getConditionValues()
                    ));
        }
        return data;
    }

    @Override
    public void save(Mart mart) {
        Properties properties = new Properties();
        properties.setProperty("user", connection.getUsername());
        properties.setProperty("password", encoder.decode(connection.getPassword()));
        SparkSession spark = parquetService.initSpark();

        Dataset<Row> data = spark
                .read()
                .parquet(mart.getNode().getDestPath())
                .select(convertStringToColumns(mart.getNode().getSelectedColumns()));

        data = prepareFilters(data, mart.getNode());
        data = renameColumn(data, mart.getNode());
        data = join(mart.getNode(), data);
        data.write()
                .mode(SaveMode.Overwrite)
                .jdbc(
                        DataSourceHelper.getDriverForDS(connection.getDbapi(), connection),
                        MetaDataHelper.getTableName(mart.getMartInfo().getMartDestSchema(),mart.getMartInfo().getMartDestTable()),
                        properties
                );
    }

    @Override
    public void deleteTable(String name) throws SQLException {
        java.sql.Connection dbconnection = this.jdbcConnector.connect(connection);
        try {
            PreparedStatement statement = dbconnection.prepareStatement(String.format("DROP TABLE IF EXISTS %s;", name));
            statement.execute();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public List<TableData> getDataByTable(Mart mart) throws SQLException {
        List<TableData> result = new ArrayList<>();
        java.sql.Connection dbconnection = this.jdbcConnector.connect(connection);
        try {
            CallableStatement statement = dbconnection.prepareCall(String.format(
                    "SELECT * FROM %s limit 100", MetaDataHelper.getTableName(mart.getMartInfo().getMartDestSchema(),mart.getMartInfo().getMartDestTable()))
            );
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                TableData data = new TableData();
                mart.getMartGraph().getSelectedColumns()
                        .forEach(column -> {
                            try {
                                data.getData().put(column.getId(), resultSet.getString(column.getId()));
                            } catch (SQLException e) {
                                e.printStackTrace();
                            }
                        });
                result.add(data);
            }

        } catch (SQLException e) {
            e.printStackTrace();
//            return result;
        }

        return result;
    }
}
