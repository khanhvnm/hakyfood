package org.example.hakyfoodbackend.modules.menu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.hakyfoodbackend.common.entity.BaseEntity;
import org.example.hakyfoodbackend.modules.menu.enums.OptionItemStatus;

import java.math.BigDecimal;

@Entity
@Table(name = "option_items")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionItem extends BaseEntity {

    @Setter
    @Column(nullable = false)
    private String name;

    @Setter
    @Column(name = "additional_price", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal additionalPrice = BigDecimal.ZERO;

    @Setter
    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OptionItemStatus status = OptionItemStatus.AVAILABLE;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_group_id", nullable = false)
    private OptionGroup optionGroup;
}
