package com.sample.myapp.web.rest;

import static com.sample.myapp.domain.ModeAsserts.*;
import static com.sample.myapp.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sample.myapp.IntegrationTest;
import com.sample.myapp.domain.Mode;
import com.sample.myapp.repository.ModeRepository;
import com.sample.myapp.repository.UserRepository;
import com.sample.myapp.repository.search.ModeSearchRepository;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import org.assertj.core.util.IterableUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.util.Streamable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ModeResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ModeResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_HANDLE = "AAAAAAAAAA";
    private static final String UPDATED_HANDLE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/modes";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/modes/_search";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ModeRepository modeRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private ModeRepository modeRepositoryMock;

    @Autowired
    private ModeSearchRepository modeSearchRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restModeMockMvc;

    private Mode mode;

    private Mode insertedMode;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Mode createEntity() {
        return new Mode().name(DEFAULT_NAME).handle(DEFAULT_HANDLE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Mode createUpdatedEntity() {
        return new Mode().name(UPDATED_NAME).handle(UPDATED_HANDLE);
    }

    @BeforeEach
    void initTest() {
        mode = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedMode != null) {
            modeRepository.delete(insertedMode);
            modeSearchRepository.delete(insertedMode);
            insertedMode = null;
        }
    }

    @Test
    @Transactional
    void createMode() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(modeSearchRepository.findAll());
        // Create the Mode
        var returnedMode = om.readValue(
            restModeMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mode)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Mode.class
        );

        // Validate the Mode in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertModeUpdatableFieldsEquals(returnedMode, getPersistedMode(returnedMode));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(modeSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedMode = returnedMode;
    }

    @Test
    @Transactional
    void createModeWithExistingId() throws Exception {
        // Create the Mode with an existing ID
        mode.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(modeSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restModeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mode)))
            .andExpect(status().isBadRequest());

        // Validate the Mode in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(modeSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(modeSearchRepository.findAll());
        // set the field null
        mode.setName(null);

        // Create the Mode, which fails.

        restModeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mode)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);

        int searchDatabaseSizeAfter = IterableUtil.sizeOf(modeSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void checkHandleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(modeSearchRepository.findAll());
        // set the field null
        mode.setHandle(null);

        // Create the Mode, which fails.

        restModeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mode)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);

        int searchDatabaseSizeAfter = IterableUtil.sizeOf(modeSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void getAllModes() throws Exception {
        // Initialize the database
        insertedMode = modeRepository.saveAndFlush(mode);

        // Get all the modeList
        restModeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(mode.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].handle").value(hasItem(DEFAULT_HANDLE)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllModesWithEagerRelationshipsIsEnabled() throws Exception {
        when(modeRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restModeMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(modeRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllModesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(modeRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restModeMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(modeRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getMode() throws Exception {
        // Initialize the database
        insertedMode = modeRepository.saveAndFlush(mode);

        // Get the mode
        restModeMockMvc
            .perform(get(ENTITY_API_URL_ID, mode.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(mode.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.handle").value(DEFAULT_HANDLE));
    }

    @Test
    @Transactional
    void getNonExistingMode() throws Exception {
        // Get the mode
        restModeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingMode() throws Exception {
        // Initialize the database
        insertedMode = modeRepository.saveAndFlush(mode);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        modeSearchRepository.save(mode);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(modeSearchRepository.findAll());

        // Update the mode
        Mode updatedMode = modeRepository.findById(mode.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedMode are not directly saved in db
        em.detach(updatedMode);
        updatedMode.name(UPDATED_NAME).handle(UPDATED_HANDLE);

        restModeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedMode.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedMode))
            )
            .andExpect(status().isOk());

        // Validate the Mode in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedModeToMatchAllProperties(updatedMode);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(modeSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<Mode> modeSearchList = Streamable.of(modeSearchRepository.findAll()).toList();
                Mode testModeSearch = modeSearchList.get(searchDatabaseSizeAfter - 1);

                assertModeAllPropertiesEquals(testModeSearch, updatedMode);
            });
    }

    @Test
    @Transactional
    void putNonExistingMode() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(modeSearchRepository.findAll());
        mode.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restModeMockMvc
            .perform(put(ENTITY_API_URL_ID, mode.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mode)))
            .andExpect(status().isBadRequest());

        // Validate the Mode in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(modeSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void putWithIdMismatchMode() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(modeSearchRepository.findAll());
        mode.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restModeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(mode))
            )
            .andExpect(status().isBadRequest());

        // Validate the Mode in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(modeSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamMode() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(modeSearchRepository.findAll());
        mode.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restModeMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mode)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Mode in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(modeSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void partialUpdateModeWithPatch() throws Exception {
        // Initialize the database
        insertedMode = modeRepository.saveAndFlush(mode);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the mode using partial update
        Mode partialUpdatedMode = new Mode();
        partialUpdatedMode.setId(mode.getId());

        restModeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMode.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedMode))
            )
            .andExpect(status().isOk());

        // Validate the Mode in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertModeUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedMode, mode), getPersistedMode(mode));
    }

    @Test
    @Transactional
    void fullUpdateModeWithPatch() throws Exception {
        // Initialize the database
        insertedMode = modeRepository.saveAndFlush(mode);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the mode using partial update
        Mode partialUpdatedMode = new Mode();
        partialUpdatedMode.setId(mode.getId());

        partialUpdatedMode.name(UPDATED_NAME).handle(UPDATED_HANDLE);

        restModeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMode.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedMode))
            )
            .andExpect(status().isOk());

        // Validate the Mode in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertModeUpdatableFieldsEquals(partialUpdatedMode, getPersistedMode(partialUpdatedMode));
    }

    @Test
    @Transactional
    void patchNonExistingMode() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(modeSearchRepository.findAll());
        mode.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restModeMockMvc
            .perform(patch(ENTITY_API_URL_ID, mode.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(mode)))
            .andExpect(status().isBadRequest());

        // Validate the Mode in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(modeSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void patchWithIdMismatchMode() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(modeSearchRepository.findAll());
        mode.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restModeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(mode))
            )
            .andExpect(status().isBadRequest());

        // Validate the Mode in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(modeSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamMode() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(modeSearchRepository.findAll());
        mode.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restModeMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(mode)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Mode in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(modeSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    @Transactional
    void deleteMode() throws Exception {
        // Initialize the database
        insertedMode = modeRepository.saveAndFlush(mode);
        modeRepository.save(mode);
        modeSearchRepository.save(mode);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(modeSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the mode
        restModeMockMvc
            .perform(delete(ENTITY_API_URL_ID, mode.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(modeSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    @Transactional
    void searchMode() throws Exception {
        // Initialize the database
        insertedMode = modeRepository.saveAndFlush(mode);
        modeSearchRepository.save(mode);

        // Search the mode
        restModeMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + mode.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(mode.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].handle").value(hasItem(DEFAULT_HANDLE)));
    }

    protected long getRepositoryCount() {
        return modeRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Mode getPersistedMode(Mode mode) {
        return modeRepository.findById(mode.getId()).orElseThrow();
    }

    protected void assertPersistedModeToMatchAllProperties(Mode expectedMode) {
        assertModeAllPropertiesEquals(expectedMode, getPersistedMode(expectedMode));
    }

    protected void assertPersistedModeToMatchUpdatableProperties(Mode expectedMode) {
        assertModeAllUpdatablePropertiesEquals(expectedMode, getPersistedMode(expectedMode));
    }
}
