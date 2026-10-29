import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

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
describe("ArticlesEditPage tests", () => {
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
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
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Article");
      expect(screen.queryByTestId("ArticleForm-title")).not.toBeInTheDocument();
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "jpa02 - Intro to Spring Boot, junit, jacoco, pitest",
        url: "https://ucsb-cs156.github.io/f26/lab/jpa02.html",
        explanation: "Instructions for assignment jpa02 of CS156 in f26.",
        email: "hzw@ucsb.edu",
        dateAdded: "2026-10-27T08:00:00",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: 17,
        title: "titlegone",
        url: "urlgone",
        explanation: "explanationgone",
        email: "emailgone",
        dateAdded: "2026-10-27T09:00:00",
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
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticleForm-id");

      const idField = screen.getByTestId("ArticleForm-id");
      const titleField = screen.getByTestId("ArticleForm-title");
      const urlField = screen.getByTestId("ArticleForm-url");
      const explanationField = screen.getByTestId("ArticleForm-explanation");
      const emailField = screen.getByTestId("ArticleForm-email");
      const dateAddedField = screen.getByTestId("ArticleForm-dateAdded");
      const submitButton = screen.getByTestId("ArticleForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");

      expect(titleField).toBeInTheDocument();
      expect(titleField).toHaveValue(
        "jpa02 - Intro to Spring Boot, junit, jacoco, pitest",
      );

      expect(urlField).toBeInTheDocument();
      expect(urlField).toHaveValue(
        "https://ucsb-cs156.github.io/f26/lab/jpa02.html",
      );

      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue(
        "Instructions for assignment jpa02 of CS156 in f26.",
      );

      expect(emailField).toBeInTheDocument();
      expect(emailField).toHaveValue("hzw@ucsb.edu");

      expect(dateAddedField).toBeInTheDocument();
      expect(dateAddedField).toHaveValue("2026-10-27T08:00");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(titleField, {
        target: { value: "titlegone" },
      });
      fireEvent.change(urlField, {
        target: { value: "urlgone" },
      });
      fireEvent.change(explanationField, {
        target: { value: "explanationgone" },
      });
      fireEvent.change(emailField, {
        target: { value: "emailgone" },
      });
      fireEvent.change(dateAddedField, {
        target: { value: "2026-10-27T09:00:00" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: titlegone",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "titlegone",
          url: "urlgone",
          explanation: "explanationgone",
          email: "emailgone",
          dateAdded: "2026-10-27T09:00",
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticleForm-id");

      const idField = screen.getByTestId("ArticleForm-id");
      const titleField = screen.getByTestId("ArticleForm-title");
      const urlField = screen.getByTestId("ArticleForm-url");
      const explanationField = screen.getByTestId("ArticleForm-explanation");
      const emailField = screen.getByTestId("ArticleForm-email");
      const dateAddedField = screen.getByTestId("ArticleForm-dateAdded");
      const submitButton = screen.getByTestId("ArticleForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");

      expect(titleField).toBeInTheDocument();
      expect(titleField).toHaveValue(
        "jpa02 - Intro to Spring Boot, junit, jacoco, pitest",
      );

      expect(urlField).toBeInTheDocument();
      expect(urlField).toHaveValue(
        "https://ucsb-cs156.github.io/f26/lab/jpa02.html",
      );

      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue(
        "Instructions for assignment jpa02 of CS156 in f26.",
      );

      expect(emailField).toBeInTheDocument();
      expect(emailField).toHaveValue("hzw@ucsb.edu");

      expect(dateAddedField).toBeInTheDocument();
      expect(dateAddedField).toHaveValue("2026-10-27T08:00");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(titleField, {
        target: { value: "titlegone" },
      });
      fireEvent.change(urlField, {
        target: { value: "urlgone" },
      });
      fireEvent.change(explanationField, {
        target: { value: "explanationgone" },
      });
      fireEvent.change(emailField, {
        target: { value: "emailgone" },
      });
      fireEvent.change(dateAddedField, {
        target: { value: "2026-10-27T09:00" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: titlegone",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });
    });
  });
});
