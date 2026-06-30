package org.example.hakyfoodbackend.config;

import lombok.RequiredArgsConstructor;
import org.example.hakyfoodbackend.property.EmailAsyncProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
@RequiredArgsConstructor
public class AsyncConfig {

    private final EmailAsyncProperty emailAsyncProperty;

    @Bean("emailExecutor")
    public Executor emailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(emailAsyncProperty.getCorePoolSize());
        executor.setMaxPoolSize(emailAsyncProperty.getMaxPoolSize());
        executor.setQueueCapacity(emailAsyncProperty.getQueueCapacity());
        executor.setKeepAliveSeconds(emailAsyncProperty.getKeepAliveSeconds());
        executor.setThreadNamePrefix("email-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }

}
