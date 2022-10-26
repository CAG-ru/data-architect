package pro.ach.data_architect.services;

import java.security.Principal;

import pro.ach.data_architect.models.notice.enums.KindNotice;

/**
 * Интерфес получения системной информации
 *
 *
 * @author ACH
 */

public interface SystemService {
    float getDiskFree();
    float getMemoryFree();
    void makeNotice(Principal principal,KindNotice kindNotice, String messString);
    void makeInfoNotice(Principal principal, String messString);
    void makeSuccessNotice(Principal principal, String messString);
    void makeWarningNotice(Principal principal, String messString);
    void makeDangerNotice(Principal principal, String messString);

}
