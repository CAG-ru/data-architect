package pro.ach.data_architect.services;

import java.util.ArrayList;
import java.util.List;

import org.apache.spark.SparkConf;
import org.apache.spark.SparkContext;
import org.apache.spark.sql.SparkSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import pro.ach.data_architect.models.connection.Connection;

@Component
public class ParquetService {

    public static final String FILE_EXTENSION = ".parquet";

    @Value("${spark.checkpoint.dir}")
    public String checkPointDir;

    public ParquetService() {
    }

    public SparkSession initSpark() {

        SparkConf sparkConf=new SparkConf()
                .setAppName("local[2]")
                .set("spark.master","local")
                .set("spark.driver.memory","2g");
        SparkContext sparkContext = SparkContext.getOrCreate(sparkConf);
        sparkContext.setCheckpointDir(checkPointDir);
        return SparkSession.builder()
                .master("local[2]")
                .sparkContext(sparkContext)
                .config(sparkConf)
                .appName("ConvertorApp")
                .getOrCreate();
    }

    public Boolean convertToParquet(Connection connection) throws Exception {
        if (connection.getDestPath().isEmpty()) {
            throw new Exception("Не задан путь у подключения");
        }
        try (SparkSession spark = initSpark()) {

            return true;
        } catch (Exception ex) {
            throw ex;
        }
    }

    public List<String> retrieveParquetFileFromPath(String path) {
        SparkSession spark = initSpark();
        List<String> res = new ArrayList<>();
        return spark
                .read()
                .parquet(path)
                .limit(10)
                .toJSON()
                .collectAsList();
    }
}
