package pro.ach.data_architect.services;

import java.text.SimpleDateFormat;

import pro.ach.data_architect.models.MetaData;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.connection.Schema;
import pro.ach.data_architect.models.connection.Table;

public class MetaDataHelper {
    public static String generatePath(Connection connection, MetaData metaData){
        SimpleDateFormat formater = new SimpleDateFormat("yyyy-MM-dd");
        return String.format("%s/%s/%s/%s.%s", connection.getDestPath(), formater.format(metaData.getVersion()),metaData.getSchema(),metaData.getSchema(),metaData.getName());
    }

    public static String getTableName(Schema schema, Table table){
        return getTableName(schema.getName(),table.getName());
    }

    public static String getTableName(MetaData data){
        return getTableName(data.getSchema(),data.getName());
    }

    public static String getTableName(String schema,String talbe){
        if(schema!=null && !schema.equals("")){
            return String.format("\"%s\".\"%s\"", schema, talbe);
        }else {
            return String.format("\"%s\"", talbe);
        }
    }
}
