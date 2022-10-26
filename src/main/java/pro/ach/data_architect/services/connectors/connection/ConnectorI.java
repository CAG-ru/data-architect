package pro.ach.data_architect.services.connectors.connection;

import java.sql.Connection;
import java.sql.SQLException;

public interface ConnectorI {
    Connection connect(pro.ach.data_architect.models.connection.Connection connect) throws SQLException;
    void disconnect();
}
