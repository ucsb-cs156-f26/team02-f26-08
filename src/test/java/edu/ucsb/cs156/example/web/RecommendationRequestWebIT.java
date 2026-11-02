package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestWebIT extends WebTestCase {

  @Autowired RecommendationRequestRepository recommendationRequestRepository;

  @Test
  public void admin_user_can_create_edit_delete_restaurant() throws Exception {
    setupUser(true);

    page.getByText("Recommendation Requests").click();

    LocalDateTime ldt1 = LocalDateTime.of(2026, 10, 10, 12, 45, 30);
    LocalDateTime ldt2 = LocalDateTime.of(2026, 10, 31, 11, 59, 59);
    RecommendationRequest recommendationRequest =
        RecommendationRequest.builder()
            .requesterEmail("cgaucho@ucsb.edu")
            .professorEmail("pconrad@ucsb.edu")
            .explanation("placeholder explanation")
            .dateRequested(ldt1)
            .dateNeeded(ldt2)
            .done(false)
            .build();

    recommendationRequestRepository.save(recommendationRequest);

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("cgaucho@ucsb.edu");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-professorEmail"))
        .hasText("pconrad@ucsb.edu");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("placeholder explanation");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-dateRequested"))
        .hasText("2026-10-10T12:45:30");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-dateNeeded"))
        .hasText("2026-10-31T11:59:59");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-done")).hasText("false");

    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-name"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_cannot_create_recommendation_requests() throws Exception {
    setupUser(false);

    page.getByText("Recommendation Requests").click();

    assertThat(page.getByText("Create Recommendation Request")).not().isVisible();
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-name"))
        .not()
        .isVisible();
  }
}
