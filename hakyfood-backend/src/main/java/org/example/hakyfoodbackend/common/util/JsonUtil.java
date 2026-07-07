package org.example.hakyfoodbackend.common.util;

import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
public class JsonUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static <T>List<T> convertJsonToList(String resourcePath, Class<T[]> arrayClass) {
        try (InputStream is = JsonUtil.class.getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new IllegalArgumentException("Resource not found: " + resourcePath);
            }
            T[] array = objectMapper.readValue(is, arrayClass);
            return new ArrayList<>(Arrays.asList(array));
        } catch (IOException e) {
            log.error("Error reading or parse JSON file from resource: {}", resourcePath, e);
            throw new RuntimeException("Failed to convert JSON file to Object list", e);
        }
    }

}
