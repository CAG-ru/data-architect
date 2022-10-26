package pro.ach.data_architect.services;

import javassist.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pro.ach.data_architect.models.mart.Mart;
import pro.ach.data_architect.models.mart.TableData;

import java.sql.SQLException;
import java.util.List;

public interface MartService {
    Page<Mart> getAll();
    Page<Mart> getAll(Pageable pageable);
    Mart findById(String id);
    Mart save(Mart mart) throws NotFoundException;
    void delete(Mart mart) throws SQLException;
    void createTable(Mart mart) throws NotFoundException;
    List<TableData> getDataByMartTable(Mart mart) throws SQLException, NotFoundException;
    void deleteOldMarts() throws SQLException;
}
