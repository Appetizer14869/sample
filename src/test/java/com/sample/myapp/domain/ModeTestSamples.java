package com.sample.myapp.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ModeTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Mode getModeSample1() {
        return new Mode().id(1L).name("name1").handle("handle1");
    }

    public static Mode getModeSample2() {
        return new Mode().id(2L).name("name2").handle("handle2");
    }

    public static Mode getModeRandomSampleGenerator() {
        return new Mode().id(longCount.incrementAndGet()).name(UUID.randomUUID().toString()).handle(UUID.randomUUID().toString());
    }
}
