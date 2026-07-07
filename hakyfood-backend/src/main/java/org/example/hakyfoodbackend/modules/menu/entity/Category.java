package org.example.hakyfoodbackend.modules.menu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.hakyfoodbackend.common.entity.BaseEntity;
import org.example.hakyfoodbackend.modules.menu.enums.CategoryStatus;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "categories")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseEntity {

    @Setter
    @Column(nullable = false)
    private String name;

    @Setter
    @Column(unique = true)
    private String slug;

    @Setter
    @Column(name = "icon_url")
    private String iconUrl;

    @Setter
    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CategoryStatus status = CategoryStatus.ACTIVE;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Category> children = new ArrayList<>();

    @ManyToMany(mappedBy = "categories", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Food> foods = new HashSet<>();
}
