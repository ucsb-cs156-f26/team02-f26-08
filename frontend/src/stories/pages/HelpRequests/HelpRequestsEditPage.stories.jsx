import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import HelpRequestsEditPage from "main/pages/HelpRequests/HelpRequestsEditPage";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

export default {
  title: "pages/HelpRequests/HelpRequestsEditPage",
  component: HelpRequestsEditPage,
};

const Template = () => <HelpRequestsEditPage storybook={true} />;

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
    http.get("/api/helprequests", () => {
      return HttpResponse.json(helpRequestFixtures.threeHelpRequests[0], {
        status: 200,
      });
    }),
    http.put("/api/helprequests", async ({ request }) => {
      const body = await request.text();
      window.alert("PUT: " + request.url + " and body: " + body);
      return HttpResponse.json(helpRequestFixtures.threeHelpRequests[0], {
        status: 200,
      });
    }),
  ],
};
