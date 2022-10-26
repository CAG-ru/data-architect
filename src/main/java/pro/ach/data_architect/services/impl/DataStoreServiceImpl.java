package pro.ach.data_architect.services.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pro.ach.data_architect.models.DataStore;
import pro.ach.data_architect.repositories.DataStoreRepository;
import pro.ach.data_architect.services.DataStoreService;

@Service
public class DataStoreServiceImpl implements DataStoreService {
    private final DataStoreRepository dataStoreRepository;

    @Autowired
    public DataStoreServiceImpl(DataStoreRepository dataStoreRepository) {
        this.dataStoreRepository = dataStoreRepository;
    }
    @Override
    public List<DataStore> getAll() {
        return dataStoreRepository.findAll();
    }

    @Override
    public DataStore findById(String id) {
        return dataStoreRepository.findById(id).orElse(null);
    }

    @Override
    public DataStore save(DataStore dataStore) {
        return dataStoreRepository.save(dataStore);
    }

    @Override
    public DataStore getMainStore() {
        List<DataStore> dataStores = this.dataStoreRepository.findAll();
        return dataStores.size()>0?dataStores.get(0):new DataStore();
    }
}
