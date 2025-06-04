package com.sample.myapp.domain;

import static com.sample.myapp.domain.PostTestSamples.*;
import static com.sample.myapp.domain.TagTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.sample.myapp.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class TagTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Tag.class);
        Tag tag1 = getTagSample1();
        Tag tag2 = new Tag();
        assertThat(tag1).isNotEqualTo(tag2);

        tag2.setId(tag1.getId());
        assertThat(tag1).isEqualTo(tag2);

        tag2 = getTagSample2();
        assertThat(tag1).isNotEqualTo(tag2);
    }

    @Test
    void postsTest() {
        Tag tag = getTagRandomSampleGenerator();
        Post postBack = getPostRandomSampleGenerator();

        tag.addPosts(postBack);
        assertThat(tag.getPosts()).containsOnly(postBack);
        assertThat(postBack.getTags()).containsOnly(tag);

        tag.removePosts(postBack);
        assertThat(tag.getPosts()).doesNotContain(postBack);
        assertThat(postBack.getTags()).doesNotContain(tag);

        tag.posts(new HashSet<>(Set.of(postBack)));
        assertThat(tag.getPosts()).containsOnly(postBack);
        assertThat(postBack.getTags()).containsOnly(tag);

        tag.setPosts(new HashSet<>());
        assertThat(tag.getPosts()).doesNotContain(postBack);
        assertThat(postBack.getTags()).doesNotContain(tag);
    }
}
