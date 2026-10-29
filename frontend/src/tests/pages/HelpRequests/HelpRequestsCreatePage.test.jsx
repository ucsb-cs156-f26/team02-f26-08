import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HelpRequestsCreatePage from "main/pages/HelpRequests/HelpRequestsCreatePage";
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

describe("HelpRequestsCreatePage tests", () => {
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
          <HelpRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /helprequests", async () => {
    const queryClient = new QueryClient();

    const helpRequest = {
      id: 3,
      requesterEmail: "student2@ucsb.edu",
      teamId: "team02-f26-08",
      tableOrBreakoutRoom: "Table 2",
      requestTime: "2026-10-26T13:30",
      explanation: "Having trouble writing unit tests.",
      solved: true,
    };

    axiosMock.onPost("/api/helprequests/post").reply(202, helpRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    const requesterEmailInput = screen.getByLabelText("Requester Email");
    const teamIdInput = screen.getByLabelText("Team ID");
    const tableOrBreakoutRoomInput = screen.getByLabelText(
      "Table or Breakout Room",
    );
    const requestTimeInput = screen.getByLabelText("Request Time");
    const explanationInput = screen.getByLabelText("Explanation");
    const solvedInput = screen.getByLabelText("Solved");

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(requesterEmailInput, {
      target: { value: "student2@ucsb.edu" },
    });
    fireEvent.change(teamIdInput, {
      target: { value: "team02-f26-08" },
    });
    fireEvent.change(tableOrBreakoutRoomInput, {
      target: { value: "Table 2" },
    });
    fireEvent.change(requestTimeInput, {
      target: { value: "2026-10-26T13:30" },
    });
    fireEvent.change(explanationInput, {
      target: { value: "Having trouble writing unit tests." },
    });
    fireEvent.click(solvedInput);

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "student2@ucsb.edu",
      teamId: "team02-f26-08",
      tableOrBreakoutRoom: "Table 2",
      requestTime: "2026-10-26T13:30",
      explanation: "Having trouble writing unit tests.",
      solved: true,
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New Help Request Created - id: 3 requesterEmail: student2@ucsb.edu",
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith({ to: "/helprequests" });
  });
});
