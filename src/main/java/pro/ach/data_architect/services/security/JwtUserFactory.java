//package pro.ach.data_architect.services.security;
//
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import pro.ach.data_architect.models.Group;
//import pro.ach.data_architect.models.User;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//public final class JwtUserFactory {
//    public JwtUserFactory() {
//    }
//
//    public static JwtUser create(User user) {
//        return new JwtUser(
//            user.getId(),
//            user.getUsername(),
//            user.getFirstName(),
//            user.getLastName(),
//            user.getPassword(),
//            user.getEmail(),
//            user.getIsActive(),
//            null,
//            mapToGrantedAuthorities(user.getGroups())
//            );
//    }
//
//    private static List<GrantedAuthority> mapToGrantedAuthorities(List<Group> groups) {
//        return groups.stream()
//            .map(group ->
//                new SimpleGrantedAuthority(group.getName())
//            ).collect(Collectors.toList());
//    }
//}
