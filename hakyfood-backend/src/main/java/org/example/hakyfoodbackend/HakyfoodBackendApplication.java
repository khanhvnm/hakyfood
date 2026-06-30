package org.example.hakyfoodbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class HakyfoodBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(HakyfoodBackendApplication.class, args);
	}

}
