package pro.ach.data_architect.exceptions.handlers;

import java.sql.SQLException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javassist.NotFoundException;
import pro.ach.data_architect.exceptions.classes.DataStoreNotFoundException;

@ControllerAdvice
public class SQLExceptionHandler {

    @ExceptionHandler(SQLException.class)
    public ResponseEntity handleException(SQLException e) {
        return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataStoreNotFoundException.class)
    public ResponseEntity handleException(DataStoreNotFoundException e) {
        return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity handleException(NotFoundException e) {
        return new ResponseEntity(e.getMessage(), HttpStatus.NOT_FOUND);
    }
}
