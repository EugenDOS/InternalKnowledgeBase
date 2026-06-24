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
    void precomputedSeedHashesMatchDemoPasswords() {
        assertTrue(passwordService.matches(
                "admin123",
                "07470c7ff72240532c18ea9b0bb523b8:534f08ff1450eb3519474e45bc3fa78a6019bab225eef9fd8ef9cbca125f0bd3"
        ));
        assertTrue(passwordService.matches(
                "user123",
                "5b9bcb1bd7d501ef1b05acc514b8294a:84785591a36eed11d38366e5c63c2f87512bf3330347976c9300e0d8aac3966a"
        ));
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

        assertFalse(passwordService.matches(null, passwordService.hashPassword("test-password")));
        assertFalse(passwordService.matches("admin123", "admin123"));
        assertFalse(passwordService.matches("test-password", "00:00"));
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
