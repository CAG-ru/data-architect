package pro.ach.data_architect.services.impl;

import java.io.File;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.springframework.stereotype.Component;

import pro.ach.data_architect.services.FileService;

@Component
public class SystemFileServiceImpl implements FileService {
    @Override
    public void save(File file, String directory) {
        File uploadDirectory = new File(directory);
        if (!uploadDirectory.exists()) {
            uploadDirectory.mkdir();
        }

        String fileName = file.getName();
        String fullFileName = directory + "/" + fileName;

        try {
            Files.deleteIfExists(Paths.get(fullFileName));
//            Files.write(Paths.get(fullFileName),
//            lines,
//                    StandardCharsets.UTF_8,
//                    StandardOpenOption.CREATE);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public List<String> getFilesByMask(String path, String mask) {
        List<String> result = new ArrayList<>();
        try (DirectoryStream<Path> dir = Files.newDirectoryStream(
                Paths.get(path), "*.csv")) {
            for (Path path1 : dir) {

                result.add(path1.toFile().getPath());
            }
        } catch (IOException exception) {
            return new ArrayList<>();
        }
        return result;
    }

    @Override
    public void delete(String path) {
        try {
            FileUtils.deleteDirectory(new File(path));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
