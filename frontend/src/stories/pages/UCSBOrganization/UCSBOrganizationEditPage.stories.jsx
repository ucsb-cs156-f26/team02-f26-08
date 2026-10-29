import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

export default {
  title: "pages/UCSBOrganization/UCSBOrganizationEditPage",
  component: UCSBOrganizationEditPage,
};

const organization = {
  orgCode: "TEST",
  orgTranslationShort: "TEST CLUB",
  orgTranslation: "UCSB TEST ORGANIZATION",
  inactive: false,
};

const Template = () => <UCSBOrganizationEditPage storybook={true} />;

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
    http.get("/api/ucsborganizations", () => {
      return HttpResponse.json(organization, {
        status: 200,
      });
    }),
    http.put("/api/ucsborganizations", async ({ request }) => {
      const updatedOrganization = await request.json();

      return HttpResponse.json(
        {
          ...organization,
          ...updatedOrganization,
        },
        { status: 200 },
      );
    }),
  ],
};
