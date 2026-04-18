package ru.mirea.rksp.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.mirea.rksp.backend.dto.user.UserResponseDto;
import ru.mirea.rksp.backend.entity.UserEntity;
import ru.mirea.rksp.backend.service.AuthService;
import ru.mirea.rksp.backend.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping
    public List<UserResponseDto> getAll(HttpServletRequest request) {
        UserEntity currentUser = authService.requireCurrentUser(request);
        return userService.getAllUsers(currentUser);
    }

    @GetMapping("/{id}")
    public UserResponseDto getById(@PathVariable String id) {
        return userService.getUserById(id);
    }
}
