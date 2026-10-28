import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItems/UCSBDiningCommonsMenuItemEditPage";

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
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("UCSBDiningCommonsMenuItemEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/ucsbdiningcommonsmenuitems", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDiningCommonsMenuItemEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit UCSBDiningCommonsMenuItem");
      expect(screen.queryByTestId("UCSBDiningCommonsMenuItem-diningCommonsCode")).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/ucsbdiningcommonsmenuitems", { params: { id: 17 } }).reply(200, {
        id: 17,
        diningCommonsCode: "Ortega",
        name: "Chicken Pot Pie",
        station: "Entree",
      });
      axiosMock.onPut("/api/ucsbdiningcommonsmenuitems").reply(200, {
        id: "17",
        diningCommonsCode: "Ortega 2",
      name: "Chicken Pot Pie 2",
      station: "Entree 2",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provide and changes when data is changed", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDiningCommonsMenuItemEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBDiningCommonsMenuItemForm-id");

      const idField = screen.getByTestId("UCSBDiningCommonsMenuItemForm-id");
      const diningCommonsCodeField = screen.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode");
      const nameField = screen.getByTestId("UCSBDiningCommonsMenuItemForm-name");
      const stationField = screen.getByTestId("UCSBDiningCommonsMenuItemForm-station");
      const submitButton = screen.getByTestId("UCSBDiningCommonsMenuItemForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(diningCommonsCodeField).toBeInTheDocument();
      expect(diningCommonsCodeField).toHaveValue("Ortega");
      expect(nameField).toBeInTheDocument();
      expect(nameField).toHaveValue("Chicken Pot Pie");
      expect(stationField).toBeInTheDocument();
      expect(stationField).toHaveValue("Entree");

      expect(submitButton).toHaveTextContent("Update");

      
      fireEvent.change(diningCommonsCodeField, {
        target: { value: "Ortega 2" },
      });
      fireEvent.change(nameField, {
        target: { value: "Chicken Pot Pie 2" },
      });
      fireEvent.change(stationField, {
        target: { value: "Entree 2" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "UCSBDiningCommonsMenuItem Updated - id: 17 diningCommonsCode: Ortega 2",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/ucsbdiningcommonsmenuitems" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          diningCommonsCode: "Ortega 2",
          name: "Chicken Pot Pie 2",
          station: "Entree 2",
        }),
      ); // posted object
      expect(mockNavigate).toBeCalledWith({ to: "/ucsbdiningcommonsmenuitems" });
    });
  });
});
