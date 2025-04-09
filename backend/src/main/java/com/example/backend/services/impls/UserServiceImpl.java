package com.example.backend.services.impls;

import com.example.backend.dto.UpdateUserProfileDto;
import com.example.backend.dto.UserDto;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.mappers.UserMapper;
import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserDto findByPublicId(String publicId) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException("User with such publicId=%s not found".formatted(publicId)));
        return userMapper.toDto(user);
    }

    @Override
    public UserDto updateUser(String publicId, UpdateUserProfileDto updateDto) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException("User with such publicId=%s not found".formatted(publicId)));

        if (updateDto.getDisplayName() != null) {
            user.setDisplayName(updateDto.getDisplayName());
        }

        if (updateDto.getDescription() != null) {
            user.setDescription(updateDto.getDescription());
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toDto(updatedUser);
    }
}