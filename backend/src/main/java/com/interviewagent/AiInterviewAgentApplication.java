package com.interviewagent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AiInterviewAgentApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiInterviewAgentApplication.class, args);
    }
}
