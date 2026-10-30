package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestsWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_edit_delete_help_request() throws Exception {
    setupUser(true);

    page.getByText("HelpRequests").click();

    // Create Help Request
    page.getByText("Create Help Request").click();
    assertThat(page.getByText("Create New Help Request")).isVisible();

    page.getByTestId("HelpRequestForm-requesterEmail").fill("cgaucho@ucsb.edu");
    page.getByTestId("HelpRequestForm-teamId").fill("f26-08");
    page.getByTestId("HelpRequestForm-tableOrBreakoutRoom").fill("7");
    page.getByTestId("HelpRequestForm-requestTime").fill("2026-10-30T17:35");
    page.getByTestId("HelpRequestForm-explanation").fill("Need help with Swagger UI");

    page.getByTestId("HelpRequestForm-submit").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("Need help with Swagger UI");

    // Edit Help Request
    page.getByTestId("HelpRequestTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Help Request")).isVisible();

    page.getByTestId("HelpRequestForm-explanation").fill("Problem resolved");
    page.getByTestId("HelpRequestForm-solved").check();
    page.getByTestId("HelpRequestForm-submit").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("Problem resolved");

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-solved")).hasText("true");

    // Delete Help Request
    page.getByTestId("HelpRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }

  @Test
  public void admin_user_can_see_create_help_request_button() throws Exception {
    setupUser(true);

    page.getByText("HelpRequests").click();

    assertThat(page.getByText("Create Help Request")).isVisible();
  }

  @Test
  public void regular_user_cannot_create_help_request() throws Exception {
    setupUser(false);

    page.getByText("HelpRequests").click();

    assertThat(page.getByText("Create Help Request")).not().isVisible();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }
}
