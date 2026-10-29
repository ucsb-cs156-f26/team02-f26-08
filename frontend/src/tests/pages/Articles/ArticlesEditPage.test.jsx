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
    useParams: vi.fn(() => ({ id: 17 })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

const initialArticle = {
  id: 17,
  title: "Original Article",
  url: "https://example.com/original",
  explanation: "Original explanation",
  email: "student@ucsb.edu",
  dateAdded: "2026-10-28T12:00",
};

const updatedArticle = {
  id: 17,
  title: "Updated Article",
  url: "https://example.com/updated",
  explanation: "Updated explanation",
  email: "updated@ucsb.edu",
  dateAdded: "2026-10-29T13:30",
};

let axiosMock;

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ArticlesEditPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ArticlesEditPage tests", () => {
  beforeEach(() => {
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
  });

  test("renders header but no form when backend does not return data", async () => {
    axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    const restoreConsole = mockConsole();
    try {
      renderPage();
      await screen.findByText("Edit Article");
      expect(screen.queryByTestId("ArticleForm-title")).not.toBeInTheDocument();
      await waitFor(() => expect(mockToast).toHaveBeenCalled());
    } finally {
      restoreConsole();
    }
  });

  test("populates the form and sends the edited article with PUT", async () => {
    axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, initialArticle);
    axiosMock.onPut("/api/articles").reply(200, updatedArticle);

    renderPage();

    const idField = await screen.findByTestId("ArticleForm-id");
    const titleField = screen.getByTestId("ArticleForm-title");
    const urlField = screen.getByTestId("ArticleForm-url");
    const explanationField = screen.getByTestId("ArticleForm-explanation");
    const emailField = screen.getByTestId("ArticleForm-email");
    const dateAddedField = screen.getByTestId("ArticleForm-dateAdded");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    expect(idField).toHaveValue("17");
    expect(titleField).toHaveValue(initialArticle.title);
    expect(urlField).toHaveValue(initialArticle.url);
    expect(explanationField).toHaveValue(initialArticle.explanation);
    expect(emailField).toHaveValue(initialArticle.email);
    expect(dateAddedField).toHaveValue(initialArticle.dateAdded);
    expect(submitButton).toHaveTextContent("Update");

    fireEvent.change(titleField, { target: { value: updatedArticle.title } });
    fireEvent.change(urlField, { target: { value: updatedArticle.url } });
    fireEvent.change(explanationField, { target: { value: updatedArticle.explanation } });
    fireEvent.change(emailField, { target: { value: updatedArticle.email } });
    fireEvent.change(dateAddedField, { target: { value: updatedArticle.dateAdded } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(
      "Article Updated - id: 17 title: Updated Article",
    ));
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/articles" });
    expect(axiosMock.history.put).toHaveLength(1);
    expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      title: updatedArticle.title,
      url: updatedArticle.url,
      explanation: updatedArticle.explanation,
      email: updatedArticle.email,
      dateAdded: updatedArticle.dateAdded,
    });
  });

  test("changes when you click Update", async () => {
    axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, initialArticle);
    axiosMock.onPut("/api/articles").reply(200, updatedArticle);

    renderPage();

    const titleField = await screen.findByTestId("ArticleForm-title");
    const submitButton = screen.getByTestId("ArticleForm-submit");
    expect(titleField).toHaveValue("Original Article");

    fireEvent.change(titleField, { target: { value: "Updated Article" } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(
      "Article Updated - id: 17 title: Updated Article",
    ));
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/articles" });
  });
});