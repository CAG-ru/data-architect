package pro.ach.data_architect.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pro.ach.data_architect.models.Group;

public interface GroupRepository extends JpaRepository<Group,Integer> {
}
