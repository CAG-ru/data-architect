package pro.ach.data_architect.services.connectors.handler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.connection.enums.TypeSource;

@Component
public class HandlerHelper {

    @Autowired
    private  ApplicationContext context;


    public DataSourceHanlerI getHandler(Connection connection){
        if(connection.getTypeSource() == TypeSource.DB){
            return context.getBean(JdbcHandler.class);
        }

        return context.getBean(CsvHandler.class);
    }

}
