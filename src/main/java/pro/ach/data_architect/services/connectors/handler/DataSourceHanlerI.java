package pro.ach.data_architect.services.connectors.handler;

import java.sql.SQLException;
import java.util.List;

import org.springframework.stereotype.Component;

import pro.ach.data_architect.dto.ParquetDto;
import pro.ach.data_architect.models.MetaData;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.connection.Database;
import pro.ach.data_architect.models.connection.enums.NestingLevel;
import pro.ach.data_architect.models.mart.Mart;
import pro.ach.data_architect.models.mart.TableData;

@Component
public interface DataSourceHanlerI {
    Database getDatabase(NestingLevel level) throws SQLException;
    ParquetDto saveToParquet(MetaData metaData);
    Connection getConnection();
    void setConnection(Connection connection);
    void save(Mart mart);
    void deleteTable(String name) throws SQLException;
    List<TableData> getDataByTable(Mart mart) throws SQLException;
}
