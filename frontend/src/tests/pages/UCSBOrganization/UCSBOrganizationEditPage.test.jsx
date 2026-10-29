import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: "TEST",
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;

describe("UCSBOrganizationEditPage tests", () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  afterEach(() => {
    mockToast.mockClear();
    mockNavigate.mockClear();
    axiosMock.restore();
    queryClient.clear();
  });

  test("renders header but no form when backend fails", async () => {
    const restoreConsole = mockConsole();

    axiosMock
      .onGet("/api/ucsborganizations", {
        params: { orgCode: "TEST" },
      })
      .timeout();

    try {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(
        await screen.findByText("Edit UCSB Organization"),
      ).toBeInTheDocument();

      expect(
        screen.queryByTestId("UCSBOrganizationForm-orgCode"),
      ).not.toBeInTheDocument();
    } finally {
      restoreConsole();
    }
  });

  test("loads organization and updates all editable fields", async () => {
    axiosMock
      .onGet("/api/ucsborganizations", {
        params: { orgCode: "TEST" },
      })
      .reply(200, {
        orgCode: "TEST",
        orgTranslationShort: "TEST CLUB",
        orgTranslation: "UCSB TEST ORGANIZATION",
        inactive: false,
      });

    axiosMock.onPut("/api/ucsborganizations").reply(200, {
      orgCode: "TEST",
      orgTranslationShort: "UPDATED CLUB",
      orgTranslation: "UPDATED UCSB ORGANIZATION",
      inactive: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const orgCodeField = await screen.findByTestId(
      "UCSBOrganizationForm-orgCode",
    );
    const shortField = screen.getByTestId(
      "UCSBOrganizationForm-orgTranslationShort",
    );
    const translationField = screen.getByTestId(
      "UCSBOrganizationForm-orgTranslation",
    );
    const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");
    const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

    expect(orgCodeField).toHaveValue("TEST");
    expect(orgCodeField).toBeDisabled();
    expect(shortField).toHaveValue("TEST CLUB");
    expect(translationField).toHaveValue("UCSB TEST ORGANIZATION");
    expect(inactiveField).not.toBeChecked();
    expect(submitButton).toHaveTextContent("Update");

    fireEvent.change(shortField, {
      target: { value: "UPDATED CLUB" },
    });
    fireEvent.change(translationField, {
      target: { value: "UPDATED UCSB ORGANIZATION" },
    });
    fireEvent.click(inactiveField);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "UCSB Organization Updated - orgCode: TEST",
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/ucsborganization",
    });

    expect(axiosMock.history.put).toHaveLength(1);
    expect(axiosMock.history.put[0].params).toEqual({
      orgCode: "TEST",
    });
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      orgCode: "TEST",
      orgTranslationShort: "UPDATED CLUB",
      orgTranslation: "UPDATED UCSB ORGANIZATION",
      inactive: true,
    });
  });
});
