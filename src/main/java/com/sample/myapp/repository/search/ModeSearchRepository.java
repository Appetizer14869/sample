package com.sample.myapp.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import com.sample.myapp.domain.Mode;
import com.sample.myapp.repository.ModeRepository;
import java.util.stream.Stream;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.scheduling.annotation.Async;

/**
 * Spring Data Elasticsearch repository for the {@link Mode} entity.
 */
public interface ModeSearchRepository extends ElasticsearchRepository<Mode, Long>, ModeSearchRepositoryInternal {}

interface ModeSearchRepositoryInternal {
    Stream<Mode> search(String query);

    Stream<Mode> search(Query query);

    @Async
    void index(Mode entity);

    @Async
    void deleteFromIndexById(Long id);
}

class ModeSearchRepositoryInternalImpl implements ModeSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final ModeRepository repository;

    ModeSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, ModeRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Stream<Mode> search(String query) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery);
    }

    @Override
    public Stream<Mode> search(Query query) {
        return elasticsearchTemplate.search(query, Mode.class).map(SearchHit::getContent).stream();
    }

    @Override
    public void index(Mode entity) {
        repository.findOneWithEagerRelationships(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(Long id) {
        elasticsearchTemplate.delete(String.valueOf(id), Mode.class);
    }
}
