import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((message) => mockToast(message)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

describe("UCSBOrganizationCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = () => {
    const queryClient = new QueryClient();

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders the Create form", async () => {
    renderPage();

    expect(
      await screen.findByText("Create New UCSBOrganization"),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Organization Code")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Organization Translation Short"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Organization Translation"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Inactive")).toBeInTheDocument();
  });

  test("submits organization data and redirects", async () => {
    const organization = {
      orgCode: "TEST123",
      orgTranslationShort: "TEST CLUB",
      orgTranslation: "TEST ORGANIZATION",
      inactive: false,
    };

    axiosMock.onPost("/api/ucsborganizations/post").reply(202, organization);

    renderPage();

    const orgCodeInput = await screen.findByLabelText("Organization Code");

    fireEvent.change(orgCodeInput, {
      target: { value: organization.orgCode },
    });

    fireEvent.change(screen.getByLabelText("Organization Translation Short"), {
      target: { value: organization.orgTranslationShort },
    });

    fireEvent.change(screen.getByLabelText("Organization Translation"), {
      target: { value: organization.orgTranslation },
    });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: "TEST123",
      orgTranslationShort: "TEST CLUB",
      orgTranslation: "TEST ORGANIZATION",
      inactive: false,
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New UCSBOrganization Created - orgCode: TEST123 name: TEST CLUB",
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/ucsborganization",
    });
  });
});
