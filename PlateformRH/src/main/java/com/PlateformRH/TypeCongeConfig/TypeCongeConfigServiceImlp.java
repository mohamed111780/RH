package com.PlateformRH.TypeCongeConfig;


import com.PlateformRH.demandeConge.TypeConge;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class TypeCongeConfigServiceImlp implements TypeCongeConfigService{
    private final TypeCongeConfigRepository typeCongeConfigRepository;


    @Override
    public TypeCongeConfigDTO saveOrUpdate(TypeCongeConfigDTO dto) {

        TypeConge type = TypeConge.valueOf(dto.getTypeConge().toUpperCase());

        TypeCongeConfig config = typeCongeConfigRepository
                .findByTypeConge(type)
                .orElse(new TypeCongeConfig());

        config.setTypeConge(type);
        config.setPlafondAnnuel(dto.getPlafondAnnuel());

        return mapToDto(typeCongeConfigRepository.save(config));
    }



    @Override
    public List<TypeCongeConfigDTO> getAllConfigs() {

        return typeCongeConfigRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }


    private TypeCongeConfigDTO mapToDto(TypeCongeConfig config) {

        TypeCongeConfigDTO dto = new TypeCongeConfigDTO();

        dto.setId(config.getId());
        dto.setTypeConge(config.getTypeConge().name());
        dto.setPlafondAnnuel(config.getPlafondAnnuel());

        return dto;
    }


}
