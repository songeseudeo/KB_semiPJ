package com.kb.realestate.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "checklist_lists")
@Getter @Setter
public class ChecklistList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TradeType type;

    private String addr;
    private String price;

    @Column(columnDefinition = "int default 0")
    private int done;

    @Column(columnDefinition = "int default 0")
    private int total;

    @Column(columnDefinition = "int default 0")
    private int progress;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum TradeType {
        월세, 전세, 매매
    }
}