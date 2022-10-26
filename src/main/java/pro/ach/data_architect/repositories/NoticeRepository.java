package pro.ach.data_architect.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pro.ach.data_architect.models.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Integer> {

  // Page<Notice> findByUserIdPageable(Integer userId, Pageable page);
  Page<Notice> findByUserId(Integer userId, Pageable page);

  @Query(value = "select * from Notices n where n.user_id = :userId and n.is_viewed = :isViewed order by n.created asc", nativeQuery = true)
  List<Notice> findByUserIdAndViewed(@Param("userId") Integer userId, @Param("isViewed") Boolean isViewed);
}