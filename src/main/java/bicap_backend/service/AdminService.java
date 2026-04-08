package bicap_backend.service;

import bicap_backend.repository.IFarmRepository;
import bicap_backend.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;



@Service
@RequiredArgsConstructor
public class AdminService {

    private final IFarmRepository farmRepository;
    private final IUserRepository userRepository;


}
