package com.sample.myapp.repository;

import com.sample.myapp.domain.Mode;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Mode entity.
 */
@Repository
public interface ModeRepository extends JpaRepository<Mode, Long> {
    @Query("select mode from Mode mode where mode.user.login = ?#{authentication.name}")
    List<Mode> findByUserIsCurrentUser();

    default Optional<Mode> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Mode> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Mode> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(value = "select mode from Mode mode left join fetch mode.user", countQuery = "select count(mode) from Mode mode")
    Page<Mode> findAllWithToOneRelationships(Pageable pageable);

    @Query("select mode from Mode mode left join fetch mode.user")
    List<Mode> findAllWithToOneRelationships();

    @Query("select mode from Mode mode left join fetch mode.user where mode.id =:id")
    Optional<Mode> findOneWithToOneRelationships(@Param("id") Long id);
}
