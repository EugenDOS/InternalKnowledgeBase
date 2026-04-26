package ru.mirea.rksp.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.mirea.rksp.backend.dto.user.UserResponseDto;
import ru.mirea.rksp.backend.entity.UserEntity;
import ru.mirea.rksp.backend.mapper.ApiMapper;
import ru.mirea.rksp.backend.repository.UserRepository;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers(UserEntity currentUser) {
        requireAdmin(currentUser);

        return userRepository.findAllByOrderByCreatedAtAsc().stream()
                .map(ApiMapper::toUserDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponseDto getUserById(String id, UserEntity currentUser) {
        requireAdmin(currentUser);

        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден"));

        return ApiMapper.toUserDto(user);
    }

    private void requireAdmin(UserEntity currentUser) {
        if (!"admin".equals(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Нет прав доступа");
        }
    }
}
