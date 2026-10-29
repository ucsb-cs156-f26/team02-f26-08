import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

export default {
  title: "pages/Articles/ArticlesEditPage",
  component: ArticlesEditPage,
};

const Template = () => <ArticlesEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/articles", () => {
      return HttpResponse.json(
        {
          id: 17,
          title: "Original Article",
          url: "https://example.com/original",
          explanation: "Original explanation",
          email: "student@ucsb.edu",
          dateAdded: "2026-10-28T12:00",
        },
        { status: 200 },
      );
    }),
    http.put("/api/articles", async ({ request }) => {
      const body = await request.text();
      window.alert("PUT: " + request.url + " and body: " + body);
      return HttpResponse.json(
        {
          id: 17,
          ...JSON.parse(body),
        },
        { status: 200 },
      );
    }),
  ],
};
