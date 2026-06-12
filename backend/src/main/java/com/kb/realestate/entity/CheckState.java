package com.kb.realestate.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "check_states")
@Getter @Setter
public class CheckState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private ChecklistList checklistList;

    @Column(name = "item_key", length = 20)
    private String itemKey;

    @Column(columnDefinition = "boolean default false")
    private boolean checked;
}