package org.example.hakyfoodbackend.modules.menu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.hakyfoodbackend.common.entity.BaseEntity;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "option_groups")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionGroup extends BaseEntity {

    @Setter
    @Column(nullable = false)
    private String name;

    @Setter
    private String description;

    @Setter
    @Column(name = "is_required", nullable = false)
    @Builder.Default
    private Boolean isRequired = false;

    @Setter
    @Column(name = "min_choices", nullable = false)
    @Builder.Default
    private Integer minChoices = 0;

    @Setter
    @Column(name = "max_choices", nullable = false)
    @Builder.Default
    private Integer maxChoices = 1;

    // Danh sách các option item thuộc nhóm này
    @OneToMany(mappedBy = "optionGroup", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OptionItem> optionItems = new ArrayList<>();

    // Quan hệ nhiều-nhiều với Food (phía inverse)
    @ManyToMany(mappedBy = "optionGroups", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Food> foods = new HashSet<>();

    /**
     * Helper method: thêm OptionItem vào nhóm và tự động thiết lập liên kết ngược.
     */
    public void addOptionItem(OptionItem item) {
        optionItems.add(item);
        item.setOptionGroup(this);
    }

    /**
     * Helper method: xóa OptionItem khỏi nhóm và gỡ liên kết ngược.
     */
    public void removeOptionItem(OptionItem item) {
        optionItems.remove(item);
        item.setOptionGroup(null);
    }
}
