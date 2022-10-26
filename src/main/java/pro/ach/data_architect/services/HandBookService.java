package pro.ach.data_architect.services;

import pro.ach.data_architect.models.handbook.HandBook;

import java.util.List;

public interface HandBookService {
    List<HandBook> getAll();
    HandBook findById(String id);
    List<HandBook> findByType(String type);
    HandBook save(HandBook handBook);
}
