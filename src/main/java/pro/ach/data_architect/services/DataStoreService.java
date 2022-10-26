package pro.ach.data_architect.services;

import pro.ach.data_architect.models.DataStore;

import java.util.List;

public interface DataStoreService {
    List<DataStore> getAll();
    DataStore findById(String id);
    DataStore save(DataStore dataStore);
    DataStore getMainStore();
}
