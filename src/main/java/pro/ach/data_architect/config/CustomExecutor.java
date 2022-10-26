package pro.ach.data_architect.config;

import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.concurrent.Callable;
import java.util.concurrent.Future;

@Component
public class CustomExecutor extends ThreadPoolTaskExecutor {
    @Override
    public <T> Future<T> submit(Callable<T> task) {
        return super.submit(new ScopeAwareCallable<T>(task, SecurityContextHolder.getContext()));
    }


    public class ScopeAwareCallable<T> implements Callable<T> {

        private Callable<T> callableTask;
        private final SecurityContext securityContext;

        public ScopeAwareCallable(Callable<T> task, SecurityContext secContex) {
            this.callableTask = task;
            this.securityContext = secContex;
        }

        @Override
        public T call() throws Exception {
            if (securityContext != null) {
                SecurityContextHolder.setContext(securityContext);
            }
            try {
                return callableTask.call();
            } finally {
                SecurityContextHolder.clearContext();
            }
        }
    }
}
