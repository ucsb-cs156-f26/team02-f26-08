import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItems/UCSBDiningCommonsMenuItemCreatePage";
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
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("UCSBDiningCommonsMenuItemCreatePage tests", () => {
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

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /ucsbdiningcommonsmenuitems", async () => {
    const queryClient = new QueryClient();
    const ucsbDiningCommonsMenuItem = {
      id: 3,
      diningCommonsCode: "Portola",
      name: "Veg Sandwich",
      station: "Salad Bar",
    };

    axiosMock
      .onPost("/api/ucsbdiningcommonsmenuitems/post")
      .reply(202, ucsbDiningCommonsMenuItem);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });

    const diningCommonsCodeInput = screen.getByLabelText("DiningCommonsCode");
    expect(diningCommonsCodeInput).toBeInTheDocument();

    const nameInput = screen.getByLabelText("Name");
    expect(nameInput).toBeInTheDocument();

    const stationInput = screen.getByLabelText("Station");
    expect(stationInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(diningCommonsCodeInput, { target: { value: "Portola" } });
    fireEvent.change(nameInput, { target: { value: "Veg Sandwich" } });
    fireEvent.change(stationInput, {
      target: { value: "Salad Bar" },
    });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      diningCommonsCode: "Portola",
      name: "Veg Sandwich",
      station: "Salad Bar",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New ucsbDiningCommonsMenuItem Created - id: 3 name: Veg Sandwich",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/ucsbdiningcommonsmenuitems" });
  });
});
