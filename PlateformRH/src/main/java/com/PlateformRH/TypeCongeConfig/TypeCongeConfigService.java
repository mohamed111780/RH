package com.PlateformRH.TypeCongeConfig;

import java.util.List;

public interface TypeCongeConfigService {


    TypeCongeConfigDTO saveOrUpdate(TypeCongeConfigDTO dto);



    List<TypeCongeConfigDTO> getAllConfigs();


}
