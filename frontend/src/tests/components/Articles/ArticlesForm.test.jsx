import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticleForm from "main/components/Articles/ArticleForm";
import { articlesFixtures } from "fixtures/articlesFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { _CardTitle } from "react-bootstrap";
import _UrlTable from "main/components/Urls/UrlTable";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticleForm tests", () => {
  const queryClient = new QueryClient();
  const expectedHeaders = ["Title", "Url", "Explanation", "Email", "Date (iso format)"]
  const fixtureParams = ["title", "url", "explanation", "email", "dateAdded"]
  
  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticleForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    for (const headerText of expectedHeaders) {
      expect(await screen.findByText(headerText)).toBeInTheDocument();
    }
    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    expect(await screen.findByText(/Cancel/)).toBeInTheDocument();
  });

  test("renders correctly when passing in an Article", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticleForm initialContents={articlesFixtures.oneArticle} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Id/)).toBeInTheDocument();
    for (const headerText of expectedHeaders) {
      expect(await screen.findByText(headerText)).toBeInTheDocument();
    }
    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    expect(await screen.findByText(/Cancel/)).toBeInTheDocument();
  });

  test("Correct error messsages on missing input", async () => {
     render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticleForm />
        </Router>
      </QueryClientProvider>,
    );
    await screen.findByTestId("ArticleForm-submit");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    fireEvent.click(submitButton);

    for (const headerText of expectedHeaders) {
      expect(await screen.findByText(`${headerText} is required.`)).toBeInTheDocument();
    }
  });

  test("No missing input error messsages on good input", async () => {
    const mockSubmitAction = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticleForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>,
    );

    for (const param of fixtureParams) {
      await screen.findByTestId(`ArticleForm-${param}`);
    }

    const titleField = screen.getByTestId("ArticleForm-title");
    const urlField = screen.getByTestId("ArticleForm-url");
    const explanationField = screen.getByTestId("ArticleForm-explanation");
    const emailField = screen.getByTestId("ArticleForm-email");
    const dateAddedField = screen.getByTestId("ArticleForm-dateAdded");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    fireEvent.change(titleField, { target: { value: "title" } });
    fireEvent.change(urlField, { target: { value: "https://url.com" } });
    fireEvent.change(explanationField, { target: { value: "explanation" } });
    fireEvent.change(emailField, { target: { value: "email@email.com" } });
    fireEvent.change(dateAddedField, {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    for (const headerText of expectedHeaders) {
      expect(screen.queryByText(`${headerText} is required.`)).not.toBeInTheDocument();
    }
  });

  test("Validation max length for inputs", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticleForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>,
    );

    const submitButton = screen.getByText(/Create/);
    for (let i = 0; i < expectedHeaders.length; i++) {
      if (expectedHeaders[i] == "Date (iso format)") {
        continue;
      }
      expect(await screen.findByText(`${expectedHeaders[i]}`)).toBeInTheDocument();
      const Input = screen.getByTestId(`ArticleForm-${fixtureParams[i]}`);
      fireEvent.change(Input, { target: { value: "a".repeat(256) } });
      fireEvent.click(submitButton);

      await waitFor(() => {
      expect(screen.getByText(/Max length 255 characters./)).toBeInTheDocument();
      });
      fireEvent.change(Input, { target: { value: ""} });
      fireEvent.click(submitButton);
    } 
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-cancel");
    const cancelButton = screen.getByTestId("ArticleForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
