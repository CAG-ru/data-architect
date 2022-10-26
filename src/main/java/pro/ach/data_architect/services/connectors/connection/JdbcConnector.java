package pro.ach.data_architect.services.connectors.connection;

import java.sql.Connection;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Component;

import pro.ach.data_architect.services.Encoder;

@Component
public class JdbcConnector implements ConnectorI {

    private final Encoder encoder;

    @Autowired
    public JdbcConnector(Encoder encoder) {
        this.encoder = encoder;
    }

    @Override
    public Connection connect(pro.ach.data_architect.models.connection.Connection connect) throws SQLException {
        String url = DataSourceHelper.getDriverForDS(connect.getDbapi(), connect);
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
//        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setUrl(url);
        dataSource.setUsername(connect.getUsername());
        dataSource.setPassword(encoder.decode(connect.getPassword()));
        return dataSource.getConnection();
    }

    @Override
    public void disconnect() {

    }
}
