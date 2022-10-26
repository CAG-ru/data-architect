package pro.ach.data_architect.services;

import java.util.List;

import pro.ach.data_architect.models.Notice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public interface NoticeService {
  List<Notice> getAll();

  Notice findById(Integer id);

  void delete(Notice notice);

  Notice save(Notice notice);

  Page<Notice> findByUserIdPageable(Integer userId, Pageable page);
  
  List<Notice> findByUserId(Integer userId);

  List<Notice> findByUserIdAndViewed(Integer userId, Boolean isViewed);
}
