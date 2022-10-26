package pro.ach.data_architect.services.impl;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import pro.ach.data_architect.models.Notice;
import pro.ach.data_architect.repositories.NoticeRepository;
import pro.ach.data_architect.services.NoticeService;

@Service
public class NoticeServiceImpl implements NoticeService {
  @Autowired
  private NoticeRepository noticeRepository;

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<Notice> getAll() {
    return this.noticeRepository.findAll();
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public Notice findById(Integer id) {
    return this.noticeRepository.findById(id).orElse(null);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public void delete(Notice notice) {
    this.noticeRepository.delete(notice);

  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public Notice save(Notice notice) {
    if (notice.getCreated() == null) {
      notice.setCreated(new Date());
    }
    return this.noticeRepository.save(notice);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<Notice> findByUserId(Integer userId) {
    return this.noticeRepository.findByUserId(userId, null).getContent();
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public Page<Notice> findByUserIdPageable(Integer userId, Pageable page) {
    return (Page<Notice>)this.noticeRepository.findByUserId(userId, page);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<Notice> findByUserIdAndViewed(Integer userId, Boolean isViewed) {
    return this.noticeRepository.findByUserIdAndViewed(userId, isViewed);
  }

}
