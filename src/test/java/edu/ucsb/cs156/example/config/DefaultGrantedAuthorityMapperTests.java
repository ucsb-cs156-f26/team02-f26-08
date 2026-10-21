package edu.ucsb.cs156.example.config;

import static org.junit.jupiter.api.Assertions.assertFalse;
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
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.core.user.OAuth2UserAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(controllers = DummyController.class)
@Import(SecurityConfig.class)
public class DefaultGrantedAuthorityMapperTests extends ControllerTestCase {
  @MockitoBean private UserRepository userRepository;

  @Autowired
  @Qualifier("PrimaryUserAuthoritiesMapper")
  GrantedAuthoritiesMapper grantedAuthorityMapper;

  @Autowired GrantedAuthoritiesMapper qaAuthorityMapper;

  @Test
  public void granted_authority_mapper_runs() {
    Map<String, Object> attributes = Map.of("email", "cgaucho@ucsb.edu", "roles", List.of("admin"));
    Set<GrantedAuthority> authority = Set.of(new OAuth2UserAuthority(attributes));
    Collection<?> mappedAuthorities = grantedAuthorityMapper.mapAuthorities(authority);
    assertTrue(mappedAuthorities.contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
    assertTrue(mappedAuthorities.contains(new SimpleGrantedAuthority("ROLE_USER")));
    assertTrue(mappedAuthorities.contains(new SimpleGrantedAuthority("ROLE_MEMBER")));
    Map<String, Object> nonAdminAttributes =
        Map.of("email", "cgaucho@notucsb.edu", "roles", List.of("cs156-student"));
    Set<GrantedAuthority> nonAdminMap = Set.of(new OAuth2UserAuthority(nonAdminAttributes));
    Collection<?> nonAdminMappedAuthorities = grantedAuthorityMapper.mapAuthorities(nonAdminMap);
    assertFalse(nonAdminMappedAuthorities.contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
    assertFalse(nonAdminMappedAuthorities.contains(new SimpleGrantedAuthority("ROLE_MEMBER")));
  }

  @Test
  public void qa_granted_authority_mapper_runs_and_delegates() {
    Map<String, Object> attributes = Map.of("email", "cgaucho@ucsb.edu", "roles", List.of("admin"));
    Set<GrantedAuthority> authority = Set.of(new OAuth2UserAuthority(attributes));
    assertTrue(
        qaAuthorityMapper
            .mapAuthorities(authority)
            .contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
    Map<String, Object> nonAdminAttributes =
        Map.of("email", "cgaucho@ucsb.edu", "roles", List.of("cs156-student"));
    Set<GrantedAuthority> nonAdminMap = Set.of(new OAuth2UserAuthority(nonAdminAttributes));
    assertFalse(
        qaAuthorityMapper
            .mapAuthorities(nonAdminMap)
            .contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
    Map<String, Object> groupAdmin =
        Map.of("email", "cgaucho@ucsb.edu", "groups", List.of("group1"));
    Set<GrantedAuthority> groupAdminMap = Set.of(new OAuth2UserAuthority(groupAdmin));
    assertFalse(
        qaAuthorityMapper
            .mapAuthorities(groupAdminMap)
            .contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
  }
}
