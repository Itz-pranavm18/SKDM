package com.skm.security;

import com.skm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // Support login by email or username
        return userRepository.findByEmailAndDeletedFalse(usernameOrEmail)
                .or(() -> userRepository.findByUsernameAndDeletedFalse(usernameOrEmail))
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with email or username: " + usernameOrEmail));
    }
}
