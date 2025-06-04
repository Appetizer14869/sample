package com.sample.myapp.domain;

import static com.sample.myapp.domain.ModeTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.sample.myapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ModeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Mode.class);
        Mode mode1 = getModeSample1();
        Mode mode2 = new Mode();
        assertThat(mode1).isNotEqualTo(mode2);

        mode2.setId(mode1.getId());
        assertThat(mode1).isEqualTo(mode2);

        mode2 = getModeSample2();
        assertThat(mode1).isNotEqualTo(mode2);
    }
}
