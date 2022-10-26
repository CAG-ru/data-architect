package pro.ach.data_architect.services;

import java.io.File;
import java.util.List;

public interface FileService {
    void save(File file, String directory);
    List<String> getFilesByMask(String path,String mask);
    void delete(String path);
}
