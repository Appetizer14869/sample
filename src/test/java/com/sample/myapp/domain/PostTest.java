package com.sample.myapp.domain;

import static com.sample.myapp.domain.ModeTestSamples.*;
import static com.sample.myapp.domain.PostTestSamples.*;
import static com.sample.myapp.domain.TagTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.sample.myapp.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class PostTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Post.class);
        Post post1 = getPostSample1();
        Post post2 = new Post();
        assertThat(post1).isNotEqualTo(post2);

        post2.setId(post1.getId());
        assertThat(post1).isEqualTo(post2);

        post2 = getPostSample2();
        assertThat(post1).isNotEqualTo(post2);
    }

    @Test
    void modeTest() {
        Post post = getPostRandomSampleGenerator();
        Mode modeBack = getModeRandomSampleGenerator();

        post.setMode(modeBack);
        assertThat(post.getMode()).isEqualTo(modeBack);

        post.mode(null);
        assertThat(post.getMode()).isNull();
    }

    @Test
    void tagsTest() {
        Post post = getPostRandomSampleGenerator();
        Tag tagBack = getTagRandomSampleGenerator();

        post.addTags(tagBack);
        assertThat(post.getTags()).containsOnly(tagBack);

        post.removeTags(tagBack);
        assertThat(post.getTags()).doesNotContain(tagBack);

        post.tags(new HashSet<>(Set.of(tagBack)));
        assertThat(post.getTags()).containsOnly(tagBack);

        post.setTags(new HashSet<>());
        assertThat(post.getTags()).doesNotContain(tagBack);
    }
}
