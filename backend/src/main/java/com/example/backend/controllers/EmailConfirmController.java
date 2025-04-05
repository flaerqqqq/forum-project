package com.example.backend.controllers;

import com.example.backend.services.EmailConfirmService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/confirm")
@RequiredArgsConstructor
public class EmailConfirmController {

    private final EmailConfirmService emailConfirmService;

    @GetMapping
    public void confirm(@RequestParam String token) {
        emailConfirmService.confirm(token);
    }
}