import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Organization Code",
    "Organization Translation Short",
    "Organization Translation",
    "Inactive",
  ];

  const testId = "UCSBOrganizationForm";

  const renderForm = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm {...props} />
        </Router>
      </QueryClientProvider>,
    );
  };

  test("renders correctly with no initialContents", async () => {
    renderForm();

    expect(await screen.findByText("Create")).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-orgCode`)).not.toBeDisabled();
  });

  test("renders correctly when passing in initialContents", async () => {
    renderForm({
      initialContents: ucsbOrganizationFixtures.oneOrganization,
      buttonLabel: "Update",
    });

    expect(await screen.findByText("Update")).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    const orgCodeInput = screen.getByTestId(`${testId}-orgCode`);

    expect(orgCodeInput).toBeDisabled();
    expect(orgCodeInput).toHaveValue(
      ucsbOrganizationFixtures.oneOrganization.orgCode,
    );

    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toHaveValue(
      ucsbOrganizationFixtures.oneOrganization.orgTranslationShort,
    );

    expect(screen.getByTestId(`${testId}-orgTranslation`)).toHaveValue(
      ucsbOrganizationFixtures.oneOrganization.orgTranslation,
    );

    expect(screen.getByTestId(`${testId}-inactive`).checked).toBe(
      ucsbOrganizationFixtures.oneOrganization.inactive,
    );
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    mockedNavigate.mockClear();

    renderForm();

    const cancelButton = await screen.findByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
  });

  test("that the correct validations are performed", async () => {
    const submitAction = vi.fn();

    renderForm({ submitAction });

    const submitButton = await screen.findByTestId(`${testId}-submit`);

    fireEvent.click(submitButton);

    expect(
      await screen.findByText("Organization Code is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Organization Translation Short is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Organization Translation is required."),
    ).toBeInTheDocument();

    expect(submitAction).not.toHaveBeenCalled();
  });

  test("rejects whitespace-only values", async () => {
    const submitAction = vi.fn();

    renderForm({ submitAction });

    fireEvent.change(screen.getByTestId(`${testId}-orgCode`), {
      target: { value: "   " },
    });

    fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
      target: { value: "   " },
    });

    fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Organization Code cannot be blank."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Organization Translation Short cannot be blank."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Organization Translation cannot be blank."),
    ).toBeInTheDocument();

    expect(submitAction).not.toHaveBeenCalled();
  });

  test("submits valid organization data", async () => {
    const submitAction = vi.fn();

    renderForm({ submitAction });

    fireEvent.change(screen.getByTestId(`${testId}-orgCode`), {
      target: { value: "SKY" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
      target: { value: "SKYDIVING CLUB" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
      target: { value: "SKYDIVING CLUB AT UCSB" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-inactive`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        {
          orgCode: "SKY",
          orgTranslationShort: "SKYDIVING CLUB",
          orgTranslation: "SKYDIVING CLUB AT UCSB",
          inactive: true,
        },
        expect.anything(),
      );
    });
  });
});
