import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UCSBOrganizationIndexPage from "main/pages/UCSBOrganization/UCSBOrganizationIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import mockConsole from "tests/testutils/mockConsole";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

describe("UCSBOrganizationIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "UCSBOrganizationTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  beforeEach(() => {
    queryClient.clear();
    mockToast.mockClear();
  });

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/ucsborganizations/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const button = await screen.findByText("Create UCSBOrganization");
    expect(button).toHaveAttribute("href", "/ucsborganization/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders three organizations correctly for regular user", async () => {
    setupUserOnly();
    axiosMock
      .onGet("/api/ucsborganizations/all")
      .reply(200, ucsbOrganizationFixtures.threeOrganizations);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
      ).toHaveTextContent("ZPR");
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgCode`),
    ).toHaveTextContent("SKY");

    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-orgCode`),
    ).toHaveTextContent("OSLI");

    expect(
      screen.queryByText("Create UCSBOrganization"),
    ).not.toBeInTheDocument();

    expect(screen.getAllByText("ZETA PHI RHO").length).toBeGreaterThan(0);
    expect(screen.getByText("SKYDIVING CLUB AT UCSB")).toBeInTheDocument();
    expect(screen.getByText("OFFICE OF STUDENT LIFE")).toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/ucsborganizations/all").timeout();

    const restoreConsole = mockConsole();

    try {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationIndexPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await waitFor(() => {
        expect(
          console.error.mock.calls.some((call) =>
            String(call[0]).includes(
              "Error communicating with backend via GET on /api/ucsborganizations/all",
            ),
          ),
        ).toBe(true);
      });
    } finally {
      restoreConsole();
    }
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();

    axiosMock
      .onGet("/api/ucsborganizations/all")
      .reply(200, ucsbOrganizationFixtures.threeOrganizations);

    axiosMock
      .onDelete("/api/ucsborganizations")
      .reply(200, "UCSBOrganization with orgCode ZPR was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
      ).toHaveTextContent("ZPR");
    });

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "UCSBOrganization with orgCode ZPR was deleted",
      );
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].url).toBe("/api/ucsborganizations");

    expect(axiosMock.history.delete[0].params).toEqual({
      orgCode: "ZPR",
    });
  });
});
