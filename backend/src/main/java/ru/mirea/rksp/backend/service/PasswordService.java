package ru.mirea.rksp.backend.service;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;

@Service
public class PasswordService {

    private static final int ITERATIONS = 65_536;
    private static final int KEY_LENGTH = 256;
    private static final int SALT_LENGTH = 16;

    private final SecureRandom secureRandom = new SecureRandom();
    private final HexFormat hexFormat = HexFormat.of();

    public String hashPassword(String password) {
        byte[] salt = new byte[SALT_LENGTH];
        secureRandom.nextBytes(salt);

        byte[] hash = deriveKey(password, salt);
        return hexFormat.formatHex(salt) + ":" + hexFormat.formatHex(hash);
    }

    public boolean matches(String rawPassword, String storedPasswordHash) {
        if (storedPasswordHash == null || storedPasswordHash.isBlank()) {
            return false;
        }

        try {
            if (isLegacyHash(storedPasswordHash)) {
                return storedPasswordHash.equals(rawPassword);
            }

            String[] parts = storedPasswordHash.split(":");
            if (parts.length != 2) {
                return false;
            }

            byte[] salt = hexFormat.parseHex(parts[0]);
            byte[] expectedHash = hexFormat.parseHex(parts[1]);
            byte[] actualHash = deriveKey(rawPassword, salt);

            return MessageDigest.isEqual(expectedHash, actualHash);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    public boolean isLegacyHash(String storedPasswordHash) {
        return storedPasswordHash != null && !storedPasswordHash.contains(":");
    }

    private byte[] deriveKey(String password, byte[] salt) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return factory.generateSecret(spec).getEncoded();
        } catch (Exception exception) {
            throw new IllegalStateException("Не удалось вычислить хэш пароля", exception);
        }
    }
}
