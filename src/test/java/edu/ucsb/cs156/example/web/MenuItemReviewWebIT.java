package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
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
public class MenuItemReviewWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_menuItemReview() throws Exception {
    setupUser(true);
    // data-testid="MenuItemReviewTable-cell-row-0-col-id"
    // data-testid="MenuItemReviewTable-cell-row-0-col-itemId"
    // data-testid="MenuItemReviewTable-cell-row-0-col-reviewerEmail"
    // data-testid="MenuItemReviewTable-cell-row-0-col-stars"
    // data-testid="MenuItemReviewTable-cell-row-0-col-comments"
    // data-testid="MenuItemReviewTable-cell-row-0-col-dateReviewed"
    // data-testid="MenuItemReviewTable-cell-row-0-col-Edit"
    // data-testid="MenuItemReviewTable-cell-row-0-col-Delete"

    page.getByText("Menu Item Reviews").click();

    page.getByText("Create Menu Item Review").click();
    assertThat(page.getByText("Create New Menu Item Review")).isVisible();
    page.getByLabel("item id").fill("1");
    page.getByLabel("reviewer email").fill("kyleli@ucsb.edu");
    page.getByLabel("stars").fill("1");
    page.getByLabel("comments").fill("this sucks");
    page.getByLabel("Date Reviewed").fill("2026-10-22T14:30");
    page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Create")).click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).hasText("1");
    // page.getByRole(AriaRole.BUTTON,new Page.GetByRoleOptions().setName("Edit")).click();
    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Menu Item Review")).isVisible();
    page.getByLabel("comments").fill("absolutely horrible");
    page.getByText("Update").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments"))
        .hasText("absolutely horrible");

    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_restaurant() throws Exception {
    setupUser(false);

    page.getByText("Menu Item Reviews").click();

    assertThat(page.getByText("Create Menu Item Review")).not().isVisible();
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-name")).not().isVisible();
  }
}
