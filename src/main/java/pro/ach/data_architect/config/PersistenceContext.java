package pro.ach.data_architect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "userAudtiting")
@EnableAspectJAutoProxy(proxyTargetClass = true)
@EnableTransactionManagement
public class PersistenceContext {


}
