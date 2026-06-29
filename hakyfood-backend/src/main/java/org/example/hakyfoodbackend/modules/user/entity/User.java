package org.example.hakyfoodbackend.modules.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.hakyfoodbackend.common.entity.BaseEntity;
import org.example.hakyfoodbackend.modules.user.enums.AccountStatus;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "hashed_password", nullable = false)
    private String hashedPassword;

    @Column(unique = true)
    private String phone;

    @Column(name = "full_name")
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.PENDING_VERIFY;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    public void updatePassword(String newHashedPassword) {
        this.hashedPassword = newHashedPassword;
    }

}

