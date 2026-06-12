package com.kb.realestate.service;

import com.kb.realestate.dto.ChecklistListDto;
import com.kb.realestate.entity.ChecklistList;
import com.kb.realestate.entity.CheckState;
import com.kb.realestate.repository.ChecklistListRepository;
import com.kb.realestate.repository.CheckStateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChecklistService {

    private final ChecklistListRepository listRepository;
    private final CheckStateRepository stateRepository;

    public List<ChecklistListDto> getAllLists() {
        return listRepository.findAll().stream()
                .map(ChecklistListDto::from)
                .collect(Collectors.toList());
    }

    public ChecklistListDto createList(ChecklistListDto dto) {
        ChecklistList entity = new ChecklistList();
        entity.setName(dto.getName());
        entity.setType(ChecklistList.TradeType.valueOf(dto.getType()));
        entity.setAddr(dto.getAddr());
        entity.setPrice(dto.getPrice());
        entity.setTotal(dto.getTotal());
        return ChecklistListDto.from(listRepository.save(entity));
    }

    @Transactional
    public void updateStates(Long listId, Map<String, Boolean> states) {
        stateRepository.deleteByChecklistListId(listId);
        ChecklistList list = listRepository.findById(listId).orElseThrow();

        states.forEach((key, checked) -> {
            CheckState state = new CheckState();
            state.setChecklistList(list);
            state.setItemKey(key);
            state.setChecked(checked);
            stateRepository.save(state);
        });

        int done = (int) states.values().stream().filter(Boolean::booleanValue).count();
        list.setDone(done);
        list.setProgress(list.getTotal() > 0 ? (int)(done * 100.0 / list.getTotal()) : 0);
        listRepository.save(list);
    }

    public Map<String, Boolean> getStates(Long listId) {
        return stateRepository.findByChecklistListId(listId).stream()
                .collect(Collectors.toMap(CheckState::getItemKey, CheckState::isChecked));
    }
}