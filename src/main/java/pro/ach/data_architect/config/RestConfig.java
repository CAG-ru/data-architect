package pro.ach.data_architect.config;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestConfig {

    @Bean
    public ObjectMapper jacksonObjectMapper()
    {
        return new ObjectMapper()
                .setPropertyNamingStrategy(propertyNamingStrategy())
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @Bean
    public PropertyNamingStrategy propertyNamingStrategy()
    {
        return new UpperCaseUnderscoreStrategy();
    }

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        List<HttpMessageConverter<?>> messageConverters = new ArrayList<>();
        MappingJackson2HttpMessageConverter jsonMessageConverter = new MappingJackson2HttpMessageConverter();
        jsonMessageConverter.setObjectMapper(jacksonObjectMapper());
        messageConverters.add(jsonMessageConverter);
        restTemplate.setMessageConverters(messageConverters);

        return restTemplate;
    }
}
