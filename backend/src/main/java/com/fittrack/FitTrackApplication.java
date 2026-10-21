package com.fittrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Clase principal de FitTrack.
 * La anotación @SpringBootApplication le dice a Spring:
 * "escanea este paquete y configura todo automáticamente".
 */
@SpringBootApplication
public class FitTrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(FitTrackApplication.class, args);
    }
}
