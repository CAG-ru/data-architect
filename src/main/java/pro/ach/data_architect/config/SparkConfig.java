package pro.ach.data_architect.config;

import org.apache.spark.SparkConf;
import org.apache.spark.SparkContext;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.SparkSession;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SparkConfig {

    @Bean
    public SparkConf conf() {
        return new SparkConf()
                .setAppName("local[2]")
                .set("spark.files.maxPartitionBytes","4194304")
                .set("hdfs.blockSize","4194304")
                .set("mapreduce.input.fileinputformat.split.maxsize","2097152")
                .set("spark.master","local")
                .set("spark.driver.memory","2g");
    }

    @Bean
    public JavaSparkContext sc() {
        return new JavaSparkContext(conf());
    }

    @Bean
    public SparkSession sparkSession() {
        SparkConf conf = conf();
        return SparkSession.builder()
                .master("local[2]")
                .sparkContext(SparkContext.getOrCreate(conf))
                .config(conf)
                .appName("ConvertorApp")
                .getOrCreate();
    }

}
