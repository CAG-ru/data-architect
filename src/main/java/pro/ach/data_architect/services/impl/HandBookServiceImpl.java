package pro.ach.data_architect.services.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import pro.ach.data_architect.models.handbook.HandBook;
import pro.ach.data_architect.repositories.HandbookRepository;
import pro.ach.data_architect.services.HandBookService;

@Component
public class HandBookServiceImpl implements HandBookService {
    private HandbookRepository handbookRepository;

    @Autowired
    public HandBookServiceImpl(HandbookRepository handbookRepository) {
        this.handbookRepository = handbookRepository;
    }

    @Override
    public List<HandBook> getAll() {
        return handbookRepository.findAll();
    }

    @Override
    public HandBook findById(String id) {
        return handbookRepository.findById(id).orElse(null);
    }

    @Override
    public List<HandBook> findByType(String type) {
        return handbookRepository.findHandBookByType(type);
    }

    @Override
    public HandBook save(HandBook handBook) {
        return handbookRepository.save(handBook);
    }
}
