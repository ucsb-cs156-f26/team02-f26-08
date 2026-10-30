package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBOrganizationWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_edit_delete_ucsborganization() throws Exception {
    setupUser(true);

    page.navigate("http://localhost:8080/ucsborganization");

    page.getByText("Create UCSBOrganization").click();
    assertThat(page.getByText("Create New UCSBOrganization")).isVisible();

    page.getByTestId("UCSBOrganizationForm-orgCode").fill("TESTORG");
    page.getByTestId("UCSBOrganizationForm-orgTranslationShort").fill("Test Org");
    page.getByTestId("UCSBOrganizationForm-orgTranslation").fill("Test Organization");
    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).hasText("TESTORG");

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslation"))
        .hasText("Test Organization");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Edit-button").click();

    assertThat(page.getByText("Edit UCSB Organization")).isVisible();

    page.getByTestId("UCSBOrganizationForm-orgTranslation").fill("Updated Test Organization");
    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslation"))
        .hasText("Updated Test Organization");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_ucsborganization() throws Exception {
    setupUser(false);

    page.navigate("http://localhost:8080/ucsborganization");

    assertThat(page.getByText("UCSB Organizations")).isVisible();
    assertThat(page.getByText("Create UCSBOrganization")).not().isVisible();
  }
}
