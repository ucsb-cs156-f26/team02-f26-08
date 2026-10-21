package edu.ucsb.cs156.example.config;

import static org.junit.jupiter.api.Assertions.assertTrue;

import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.controllers.DummyController;
import edu.ucsb.cs156.example.repositories.UserRepository;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.core.user.OAuth2UserAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(controllers = DummyController.class)
@ActiveProfiles({"test", "QA"})
@TestPropertySource(properties = {"app.admin.group=group1"})
@Import(SecurityConfig.class)
public class QAGrantedAuthorityMapperTests extends ControllerTestCase {
  @MockitoBean private UserRepository userRepository;

  @Autowired GrantedAuthoritiesMapper qaAuthorityMapper;

  @Test
  public void qa_granted_authority_mapper_runs_and_delegates() {
    // check that it delegates to the original
    Map<String, Object> attributes = Map.of("email", "cgaucho@ucsb.edu", "roles", List.of("admin"));
    Set<GrantedAuthority> authority = Set.of(new OAuth2UserAuthority(attributes));
    Collection<?> mappedAuthorities = qaAuthorityMapper.mapAuthorities(authority);
    assertTrue(mappedAuthorities.contains(new SimpleGrantedAuthority("ROLE_ADMIN")));

    // check that group admins are marked admin
    Map<String, Object> groupAdmin =
        Map.of("email", "cgaucho@ucsb.edu", "groups", List.of("group1"));
    Set<GrantedAuthority> groupAdminMap = Set.of(new OAuth2UserAuthority(groupAdmin));
    Collection<?> groupAdminMappedAuthorities = qaAuthorityMapper.mapAuthorities(groupAdminMap);
    assertTrue(groupAdminMappedAuthorities.contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
  }
}
