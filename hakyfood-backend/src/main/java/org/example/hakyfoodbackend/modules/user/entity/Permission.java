package org.example.hakyfoodbackend.modules.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.hakyfoodbackend.common.entity.BaseEntity;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "permissions")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    private String name;

    private String description;

    @ManyToMany(mappedBy = "permissions")
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

}