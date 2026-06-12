package com.kb.realestate.dto;

import com.kb.realestate.entity.ChecklistList;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter
public class ChecklistListDto {

    private Long id;
    private String name;
    private String type;
    private String addr;
    private String price;
    private int done;
    private int total;
    private int progress;
    private LocalDateTime createdAt;

    public static ChecklistListDto from(ChecklistList entity) {
        ChecklistListDto dto = new ChecklistListDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setType(entity.getType().name());
        dto.setAddr(entity.getAddr());
        dto.setPrice(entity.getPrice());
        dto.setDone(entity.getDone());
        dto.setTotal(entity.getTotal());
        dto.setProgress(entity.getProgress());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}