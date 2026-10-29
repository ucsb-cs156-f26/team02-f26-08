import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import RecommendationRequestsEditPage from "main/pages/RecommendationRequests/RecommendationRequestsEditPage";

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
describe("RecommendationRequestsEditPage tests", () => {
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
      axiosMock
        .onGet("/api/RECOMMENDATIONREQUESTS", { params: { id: 17 } })
        .timeout();
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
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Recommendation Request");
      expect(
        screen.queryByTestId("RecommendationRequest-requesterEmail"),
      ).not.toBeInTheDocument();
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
      axiosMock
        .onGet("/api/RECOMMENDATIONREQUESTS", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          requesterEmail: "cgaucho@ucsb.edu",
          professorEmail: "phtcon@ucsb.edu",
          explanation: "BS/MS Program",
          dateRequested: "2022-04-20T00:00:00",
          dateNeeded: "2022-05-01T00:00:00",
          done: "false",
        });
      axiosMock.onPut("/api/RECOMMENDATIONREQUESTS").reply(200, {
        id: 17,
        requesterEmail: "cgaucho@ucsb.edu",
        professorEmail: "phtcon@ucsb.edu",
        explanation: "BS/MS Program",
        dateRequested: "2022-04-20T00:00:00",
        dateNeeded: "2022-05-01T00:00:00",
        done: "false",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided, and changes when data is changed", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-id");

      const idField = screen.getByTestId("RecommendationRequestForm-id");
      const requesterEmailField = screen.getByLabelText("Requester Email");
      const professorEmailField = screen.getByLabelText("Professor Email");
      const explanationField = screen.getByLabelText("Explanation");
      const dateRequestedField = screen.getByLabelText(
        "Date Requested (in UTC)",
      );
      const dateNeededField = screen.getByLabelText("Date Needed (in UTC)");
      const doneField = screen.getByLabelText("Done");

      const submitButton = screen.getByText("Update");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");

      expect(requesterEmailField).toBeInTheDocument();
      expect(requesterEmailField).toHaveValue("cgaucho@ucsb.edu");

      expect(professorEmailField).toBeInTheDocument();
      expect(professorEmailField).toHaveValue("phtcon@ucsb.edu");

      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("BS/MS Program");

      expect(dateRequestedField).toBeInTheDocument();
      expect(dateRequestedField).toHaveValue("2022-04-20T00:00");

      expect(dateNeededField).toBeInTheDocument();
      expect(dateNeededField).toHaveValue("2022-05-01T00:00");

      expect(doneField).toBeInTheDocument();
      expect(doneField).toHaveValue("false");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(requesterEmailField, {
        target: { value: "cgaucho@ucsb.edu" },
      });
      fireEvent.change(professorEmailField, {
        target: { value: "jmaeda@ucsb.edu" },
      });
      fireEvent.change(explanationField, {
        target: { value: "BS/MS Program" },
      });
      fireEvent.change(dateRequestedField, {
        target: { value: "2022-04-20T00:00:00" },
      });
      fireEvent.change(dateNeededField, {
        target: { value: "2022-05-01T00:00:00" },
      });
      fireEvent.change(doneField, {
        target: { value: "false" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Recommendation Request Updated - id: 17 requesterEmail: cgaucho@ucsb.edu",
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/RECOMMENDATIONREQUESTS",
      });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "cgaucho@ucsb.edu",
          professorEmail: "jmaeda@ucsb.edu",
          explanation: "BS/MS Program",
          dateRequested: "2022-04-20T00:00",
          dateNeeded: "2022-05-01T00:00",
          done: "false",
        }),
      ); // posted object
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/RECOMMENDATIONREQUESTS",
      });
    });
  });
});
