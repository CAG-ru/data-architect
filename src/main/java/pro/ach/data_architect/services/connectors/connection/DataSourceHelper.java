package pro.ach.data_architect.services.connectors.connection;


import lombok.extern.log4j.Log4j2;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.connection.enums.TypeDatabase;

@Log4j2
public class DataSourceHelper {

    public static String getDriverForDS(TypeDatabase dataSource, Connection connection){
        switch (dataSource){
            case MYSQL:return getMysqlConnection(connection);
            case PGSQL:return getPostgresConnection(connection);
            case ORACLE:return getOracleConnection(connection);
            case MSSQL:return getMSSqlConnection(connection);
            default: return "postgresql";
        }
    }


    public static String getPostgresConnection(Connection connection){
        return String.format(
                "jdbc:postgresql://%s:%d/%s",
                connection.getHost(),
                connection.getPort(),
                connection.getDatabase()
        );
    }

    public static String getMysqlConnection(Connection connection){
        return String.format(
                "jdbc:mysql://%s:%d/%s",
                connection.getHost(),
                connection.getPort(),
                connection.getDatabase()
        );
    }

    public static String getMSSqlConnection(Connection connection){
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        } catch (Exception e) {
            log.error(e.getMessage());
            log.error(e.getStackTrace());
        }
        return String.format(
                "jdbc:sqlserver://%s:%d;DatabaseName=%s",
                connection.getHost(),
                connection.getPort(),
                connection.getDatabase()
        );
    }

    public static String getOracleConnection(Connection connection){
        return String.format(
                "jdbc:oracle:thin:@%s:%d:%s",
                connection.getHost(),
                connection.getPort(),
                connection.getDatabase()
        );
    }
}
