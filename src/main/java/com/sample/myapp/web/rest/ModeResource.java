package com.sample.myapp.web.rest;

import com.sample.myapp.domain.Mode;
import com.sample.myapp.repository.ModeRepository;
import com.sample.myapp.repository.search.ModeSearchRepository;
import com.sample.myapp.web.rest.errors.BadRequestAlertException;
import com.sample.myapp.web.rest.errors.ElasticsearchExceptionMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.sample.myapp.domain.Mode}.
 */
@RestController
@RequestMapping("/api/modes")
@Transactional
public class ModeResource {

    private static final Logger LOG = LoggerFactory.getLogger(ModeResource.class);

    private static final String ENTITY_NAME = "mode";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ModeRepository modeRepository;

    private final ModeSearchRepository modeSearchRepository;

    public ModeResource(ModeRepository modeRepository, ModeSearchRepository modeSearchRepository) {
        this.modeRepository = modeRepository;
        this.modeSearchRepository = modeSearchRepository;
    }

    /**
     * {@code POST  /modes} : Create a new mode.
     *
     * @param mode the mode to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new mode, or with status {@code 400 (Bad Request)} if the mode has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Mode> createMode(@Valid @RequestBody Mode mode) throws URISyntaxException {
        LOG.debug("REST request to save Mode : {}", mode);
        if (mode.getId() != null) {
            throw new BadRequestAlertException("A new mode cannot already have an ID", ENTITY_NAME, "idexists");
        }
        mode = modeRepository.save(mode);
        modeSearchRepository.index(mode);
        return ResponseEntity.created(new URI("/api/modes/" + mode.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, mode.getId().toString()))
            .body(mode);
    }

    /**
     * {@code PUT  /modes/:id} : Updates an existing mode.
     *
     * @param id the id of the mode to save.
     * @param mode the mode to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated mode,
     * or with status {@code 400 (Bad Request)} if the mode is not valid,
     * or with status {@code 500 (Internal Server Error)} if the mode couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Mode> updateMode(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody Mode mode)
        throws URISyntaxException {
        LOG.debug("REST request to update Mode : {}, {}", id, mode);
        if (mode.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, mode.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!modeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        mode = modeRepository.save(mode);
        modeSearchRepository.index(mode);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, mode.getId().toString()))
            .body(mode);
    }

    /**
     * {@code PATCH  /modes/:id} : Partial updates given fields of an existing mode, field will ignore if it is null
     *
     * @param id the id of the mode to save.
     * @param mode the mode to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated mode,
     * or with status {@code 400 (Bad Request)} if the mode is not valid,
     * or with status {@code 404 (Not Found)} if the mode is not found,
     * or with status {@code 500 (Internal Server Error)} if the mode couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Mode> partialUpdateMode(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Mode mode
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Mode partially : {}, {}", id, mode);
        if (mode.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, mode.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!modeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Mode> result = modeRepository
            .findById(mode.getId())
            .map(existingMode -> {
                if (mode.getName() != null) {
                    existingMode.setName(mode.getName());
                }
                if (mode.getHandle() != null) {
                    existingMode.setHandle(mode.getHandle());
                }

                return existingMode;
            })
            .map(modeRepository::save)
            .map(savedMode -> {
                modeSearchRepository.index(savedMode);
                return savedMode;
            });

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, mode.getId().toString())
        );
    }

    /**
     * {@code GET  /modes} : get all the modes.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of modes in body.
     */
    @GetMapping("")
    public List<Mode> getAllModes(@RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload) {
        LOG.debug("REST request to get all Modes");
        if (eagerload) {
            return modeRepository.findAllWithEagerRelationships();
        } else {
            return modeRepository.findAll();
        }
    }

    /**
     * {@code GET  /modes/:id} : get the "id" mode.
     *
     * @param id the id of the mode to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the mode, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Mode> getMode(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Mode : {}", id);
        Optional<Mode> mode = modeRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(mode);
    }

    /**
     * {@code DELETE  /modes/:id} : delete the "id" mode.
     *
     * @param id the id of the mode to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMode(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Mode : {}", id);
        modeRepository.deleteById(id);
        modeSearchRepository.deleteFromIndexById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code SEARCH  /modes/_search?query=:query} : search for the mode corresponding
     * to the query.
     *
     * @param query the query of the mode search.
     * @return the result of the search.
     */
    @GetMapping("/_search")
    public List<Mode> searchModes(@RequestParam("query") String query) {
        LOG.debug("REST request to search Modes for query {}", query);
        try {
            return StreamSupport.stream(modeSearchRepository.search(query).spliterator(), false).toList();
        } catch (RuntimeException e) {
            throw ElasticsearchExceptionMapper.mapException(e);
        }
    }
}
