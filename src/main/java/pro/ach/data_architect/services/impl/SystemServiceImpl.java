package pro.ach.data_architect.services.impl;

import java.io.File;
import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pro.ach.data_architect.models.Notice;
import pro.ach.data_architect.models.notice.enums.KindNotice;
import pro.ach.data_architect.services.AuthUserService;
import pro.ach.data_architect.services.NoticeService;
import pro.ach.data_architect.services.SystemService;

@Service
public class SystemServiceImpl implements SystemService {
    @Autowired
    private NoticeService noticeService;
    @Autowired
    private AuthUserService authUserService;

    // ----------------------------------------------------------------------------------------------
    @Override
    public float getDiskFree() {
        return ((float)new File("/").getUsableSpace())/1024/1024/1024;
    }

    // ----------------------------------------------------------------------------------------------
    @Override
    public float getMemoryFree() {
        return ( (float) Runtime.getRuntime().totalMemory()-(float)Runtime.getRuntime().freeMemory())/1024/1024/1024;
    }

    // ----------------------------------------------------------------------------------------------
    @Override
    public void makeNotice(Principal principal, KindNotice kindNotice, String messString) {
        Notice notice = new Notice();

        notice.setKind(kindNotice.name());
        notice.setMessage(messString);
        notice.setUserId(authUserService.findByUsername(principal.getName()).getId());
        notice.setIsViewed(false);

        noticeService.save(notice);
    }

    // ----------------------------------------------------------------------------------------------
    @Override
    public void makeInfoNotice(Principal principal, String messString) {
        makeNotice(principal, KindNotice.INFO, messString);        
    }

    // ----------------------------------------------------------------------------------------------
    @Override
    public void makeSuccessNotice(Principal principal, String messString) {
        makeNotice(principal, KindNotice.SUCCESS, messString);        
    }

    // ----------------------------------------------------------------------------------------------
    @Override
    public void makeWarningNotice(Principal principal, String messString) {
        makeNotice(principal, KindNotice.WARNING, messString);
    }

    // ----------------------------------------------------------------------------------------------
    @Override
    public void makeDangerNotice(Principal principal, String messString) {
        makeNotice(principal, KindNotice.DANGER, messString);
    }
}
