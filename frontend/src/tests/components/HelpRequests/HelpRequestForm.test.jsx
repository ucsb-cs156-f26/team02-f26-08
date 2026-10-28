import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import HelpRequestForm from "main/components/HelpRequests/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    await screen.findByText(/Requester Email/);
    await screen.findByText(/Create/);

    expect(screen.getByText(/Requester Email/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a HelpRequest", async () => {
    render(
      <Router>
        <HelpRequestForm initialContents={helpRequestFixtures.oneHelpRequest} />
      </Router>,
    );

    await screen.findByTestId(/HelpRequestForm-id/);

    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/HelpRequestForm-id/)).toHaveValue("1");
  });

  test("Correct Error messages on bad input", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    await screen.findByTestId("HelpRequestForm-requestTime");
    const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    fireEvent.change(requestTimeField, {
      target: { value: "bad-input" },
    });

    fireEvent.click(submitButton);
    await screen.findByText(/Request Time is required./);
    expect(screen.getByText(/Request Time is required./)).toBeInTheDocument();
  });

  test("Correct Error messages on missing input", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    await screen.findByTestId("HelpRequestForm-submit");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");
    fireEvent.click(submitButton);
    await screen.findByText(/Requester Email is required./);

    expect(
      screen.getByText(/Requester Email is required./),
    ).toBeInTheDocument();

    expect(screen.getByText(/Team ID is required./)).toBeInTheDocument();

    expect(
      screen.getByText(/Table or Breakout Room is required./),
    ).toBeInTheDocument();

    expect(screen.getByText(/Request Time is required./)).toBeInTheDocument();

    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
  });

  test("No Error messages on good input", async () => {
    const mockSubmitAction = vi.fn();
    render(
      <Router>
        <HelpRequestForm submitAction={mockSubmitAction} />
      </Router>,
    );

    await screen.findByTestId("HelpRequestForm-requesterEmail");
    const requesterEmailField = screen.getByTestId(
      "HelpRequestForm-requesterEmail",
    );

    const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
    const tableOrBreakoutRoomField = screen.getByTestId(
      "HelpRequestForm-tableOrBreakoutRoom",
    );

    const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
    const explanationField = screen.getByTestId("HelpRequestForm-explanation");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    fireEvent.change(requesterEmailField, {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(teamIdField, {
      target: { value: "team02" },
    });
    fireEvent.change(tableOrBreakoutRoomField, {
      target: { value: "Table 5" },
    });
    fireEvent.change(requestTimeField, {
      target: { value: "2026-10-28T12:00" },
    });
    fireEvent.change(explanationField, {
      target: { value: "Need help with React components" },
    });

    fireEvent.click(submitButton);
    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Requester Email is required./),
    ).not.toBeInTheDocument();

    expect(screen.queryByText(/Team ID is required./)).not.toBeInTheDocument();

    expect(
      screen.queryByText(/Request Time is required./),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(/Explanation is required./),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    await screen.findByTestId("HelpRequestForm-cancel");
    const cancelButton = screen.getByTestId("HelpRequestForm-cancel");

    fireEvent.click(cancelButton);
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});