package pro.ach.data_architect.config;

import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

@Configuration
public class KafkaConfig {

    @Bean
    public DefaultKafkaProducerFactory producerFactory(KafkaProperties properties) {
        return new DefaultKafkaProducerFactory(properties.buildAdminProperties());
    }

    @Bean
    public KafkaTemplate kafkaTemplate(ProducerFactory<String, String> factory) {
        return new KafkaTemplate(factory);
    }
}
