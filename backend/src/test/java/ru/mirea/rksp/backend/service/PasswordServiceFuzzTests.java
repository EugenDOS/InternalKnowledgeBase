package ru.mirea.rksp.backend.service;

import org.junit.jupiter.api.Test;

import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordServiceFuzzTests {

    private static final String ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" +
            " !@#$%^&*()_+-={}[]:;\"'<>,.?/\\|~`" +
            "абвгдежзийклмнопрстуфхцчшщъыьэюя";

    private final PasswordService passwordService = new PasswordService();
    private final Random random = new Random(42);

    @Test
    void randomPasswordsAreHashedAndVerified() {
        for (int index = 0; index < 50; index++) {
            String password = randomString(1 + random.nextInt(80));

            String hash = passwordService.hashPassword(password);

            assertTrue(passwordService.matches(password, hash));
            assertFalse(passwordService.matches(password + "_wrong", hash));
        }
    }

    @Test
    void hashesForSamePasswordUseDifferentSalt() {
        String password = "RepeatedPassword123!";

        String firstHash = passwordService.hashPassword(password);
        String secondHash = passwordService.hashPassword(password);

        assertNotEquals(firstHash, secondHash);
        assertTrue(passwordService.matches(password, firstHash));
        assertTrue(passwordService.matches(password, secondHash));
    }

    @Test
    void malformedHashesDoNotCrashMatcher() {
        String[] malformedHashes = {
                null,
                "",
                "   ",
                "not-a-real-hash",
                "bad:hex:value",
                ":",
                "::::",
                "zzzz:yyyy",
                randomString(250)
        };

        for (String malformedHash : malformedHashes) {
            assertFalse(passwordService.matches("test-password", malformedHash));
        }
    }

    private String randomString(int length) {
        StringBuilder builder = new StringBuilder(length);

        for (int index = 0; index < length; index++) {
            int randomIndex = random.nextInt(ALPHABET.length());
            builder.append(ALPHABET.charAt(randomIndex));
        }

        return builder.toString();
    }
}
