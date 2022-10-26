package pro.ach.data_architect.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.stereotype.Component;

@Component
public class Encoder {

    @Value("${salt}")
    public String salt;
    @Value("${password-salt}")
    public String passwordSold;

    public String encode(String value) {
        try {
            return Encryptors.text(passwordSold, salt).encrypt(value);
        } catch (IllegalArgumentException exception) {
            return value;
        }
    }

    public String decode(String value) {
        try {
            return Encryptors.text(passwordSold, salt).decrypt(value);
        } catch (IllegalArgumentException exception) {
            return value;
        }
    }

}
