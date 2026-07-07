package org.example.hakyfoodbackend.modules.menu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.hakyfoodbackend.common.entity.BaseEntity;
import org.example.hakyfoodbackend.modules.menu.enums.FoodStatus;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "foods")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Food extends BaseEntity {

    @Setter
    @Column(nullable = false)
    private String name;

    @Setter
    @Column(unique = true)
    private String slug;

    @Setter
    @Column(columnDefinition = "TEXT")
    private String description;

    @Setter
    @Column(name = "image_url")
    private String imageUrl;

    @Setter
    @Column(name = "video_url")
    private String videoUrl;

    @Setter
    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FoodStatus status = FoodStatus.AVAILABLE;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "food_images", joinColumns = @JoinColumn(name = "food_id"))
    @Column(name = "image_url")
    @OrderColumn(name = "display_order")
    @Builder.Default
    private List<String> detailImageUrls = new ArrayList<>();

    // Quan hệ nhiều-nhiều với Category
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "food_categories",
            joinColumns = @JoinColumn(name = "food_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private Set<Category> categories = new HashSet<>();

    // Quan hệ nhiều-nhiều với OptionGroup
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "food_option_groups",
            joinColumns = @JoinColumn(name = "food_id"),
            inverseJoinColumns = @JoinColumn(name = "option_group_id")
    )
    @Builder.Default
    private Set<OptionGroup> optionGroups = new HashSet<>();

    public void setCategories(Set<Category> categories) {
        this.categories = categories != null
                ? new HashSet<>(categories)
                : new HashSet<>();
    }

    public void setOptionGroups(Set<OptionGroup> optionGroups) {
        this.optionGroups = optionGroups != null
                ? new HashSet<>(optionGroups)
                : new HashSet<>();
    }

    public void setDetailImageUrls(List<String> detailImageUrls) {
        this.detailImageUrls = detailImageUrls != null
                ? new ArrayList<>(detailImageUrls)
                : new ArrayList<>();
    }
}
