import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemReviewEditPage from "main/pages/MenuItemReviews/MenuItemReviewEditPage";

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
describe("MenuItemReviewEditPage tests", () => {
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
      axiosMock.onGet("/api/menuitemreviews", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Menu Item Review");
      expect(
        screen.queryByTestId("MenuItemReviewForm-itemId"),
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
        .onGet("/api/menuitemreviews", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          itemId: 1,
          reviewerEmail: "kyleli@ucsb.edu",
          stars: 1,
          comments: "this sucks",
          dateReviewed: "2026-10-26T14:30:00",
        });
      axiosMock.onPut("/api/menuitemreviews").reply(200, {
        id: "17",
        itemId: "44",
        reviewerEmail: "jasontheween@ucsb.edu",
        stars: "3",
        comments: "alright",
        dateReviewed: "2026-11-26T14:30:00",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      const idField = screen.getByTestId("MenuItemReviewForm-id");
      const itemIdField = screen.getByLabelText("item id");
      const reviewerEmailField = screen.getByLabelText("reviewer email");
      const starsField = screen.getByLabelText("stars");
      const commentsField = screen.getByLabelText("comments");
      const dateReviewedField = screen.getByLabelText("Date Reviewed");
      const submitButton = screen.getByRole("button", { name: "Update" });

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(itemIdField).toBeInTheDocument();
      expect(itemIdField).toHaveValue(1);
      expect(reviewerEmailField).toBeInTheDocument();
      expect(reviewerEmailField).toHaveValue("kyleli@ucsb.edu");
      expect(starsField).toBeInTheDocument();
      expect(starsField).toHaveValue(1);
      expect(commentsField).toBeInTheDocument();
      expect(commentsField).toHaveValue("this sucks");
      expect(dateReviewedField).toBeInTheDocument();
      expect(dateReviewedField).toHaveValue("2026-10-26T14:30");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(itemIdField, {
        target: { value: "44" },
      });
      fireEvent.change(reviewerEmailField, {
        target: { value: "jasontheween@ucsb.edu" },
      });
      fireEvent.change(starsField, {
        target: { value: "3" },
      });
      fireEvent.change(commentsField, {
        target: { value: "alright" },
      });
      fireEvent.change(dateReviewedField, {
        target: { value: "2026-11-26T14:30" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "MenuItemReview Updated - id: 17 itemId: 44",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/menuitemreviews" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          itemId: "44",
          reviewerEmail: "jasontheween@ucsb.edu",
          stars: "3",
          comments: "alright",
          dateReviewed: "2026-11-26T14:30",
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      const idField = screen.getByTestId("MenuItemReviewForm-id");
      const itemIdField = screen.getByLabelText("item id");
      const reviewerEmailField = screen.getByLabelText("reviewer email");
      const starsField = screen.getByLabelText("stars");
      const commentsField = screen.getByLabelText("comments");
      const dateReviewedField = screen.getByLabelText("Date Reviewed");
      const submitButton = screen.getByRole("button", { name: "Update" });

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(itemIdField).toBeInTheDocument();
      expect(itemIdField).toHaveValue(1);
      expect(reviewerEmailField).toBeInTheDocument();
      expect(reviewerEmailField).toHaveValue("kyleli@ucsb.edu");
      expect(starsField).toBeInTheDocument();
      expect(starsField).toHaveValue(1);
      expect(commentsField).toBeInTheDocument();
      expect(commentsField).toHaveValue("this sucks");
      expect(dateReviewedField).toBeInTheDocument();
      expect(dateReviewedField).toHaveValue("2026-10-26T14:30");

      fireEvent.change(itemIdField, {
        target: { value: "44" },
      });
      fireEvent.change(reviewerEmailField, {
        target: { value: "jasontheween@ucsb.edu" },
      });
      fireEvent.change(starsField, {
        target: { value: "3" },
      });
      fireEvent.change(commentsField, {
        target: { value: "alright" },
      });
      fireEvent.change(dateReviewedField, {
        target: { value: "2026-11-26T14:30" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "MenuItemReview Updated - id: 17 itemId: 44",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/menuitemreviews" });
    });
  });
});
