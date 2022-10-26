package pro.ach.data_architect.dto;

import lombok.Data;

@Data
public class CheckConnectionRequestDto {
    private String dbapi;
    private String host;
    private String port;
    private String database;
    private String username;
    private String password;
}
