package ru.mirea.rksp.backend.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTests {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handlesResponseStatusExceptionWithReason() {
        var response = handler.handleResponseStatusException(
                new ResponseStatusException(HttpStatus.FORBIDDEN, "Нет прав")
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Нет прав", response.getBody().error());
    }

    @Test
    void handlesResponseStatusExceptionWithoutReason() {
        var response = handler.handleResponseStatusException(
                new ResponseStatusException(HttpStatus.BAD_REQUEST)
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Ошибка сервера", response.getBody().error());
    }

    @Test
    void handlesMalformedJson() {
        var response = handler.handleHttpMessageNotReadableException();

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Некорректное тело запроса", response.getBody().error());
    }

    @Test
    void handlesUnexpectedException() {
        var response = handler.handleUnexpectedException(new RuntimeException("boom"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Ошибка сервера", response.getBody().error());
    }
}
