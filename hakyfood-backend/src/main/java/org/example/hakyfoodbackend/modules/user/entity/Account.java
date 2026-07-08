package org.example.hakyfoodbackend.modules.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.hakyfoodbackend.common.entity.BaseEntity;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.modules.user.enums.AccountStatus;
import org.example.hakyfoodbackend.modules.user.enums.AuthProvider;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "accounts")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "hashed_password")
    private String hashedPassword;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false)
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.PENDING_VERIFY;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "account_roles",
            joinColumns = @JoinColumn(name = "account_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private User user;

    public void updatePassword(String newHashedPassword) {
        this.hashedPassword = newHashedPassword;
    }

    public void activateAccount() {
        if (this.accountStatus != AccountStatus.PENDING_VERIFY) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_PENDING_VERIFY);
        }
        this.accountStatus = AccountStatus.ACTIVE;
    }

}
