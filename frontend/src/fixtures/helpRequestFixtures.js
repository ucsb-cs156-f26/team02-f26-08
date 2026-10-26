const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "student1@ucsb.edu",
    teamId: "team02-f26-08",
    tableOrBreakoutRoom: "Table 1",
    requestTime: "2026-10-26T12:00:00",
    explanation: "Need help debugging a Spring Boot controller.",
    solved: false,
  },
  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "student1@ucsb.edu",
      teamId: "team02-f26-08",
      tableOrBreakoutRoom: "Table 1",
      requestTime: "2026-10-26T12:00:00",
      explanation: "Need help debugging a Spring Boot controller.",
      solved: false,
    },
    {
      id: 3,
      requesterEmail: "student2@ucsb.edu",
      teamId: "team02-f26-08",
      tableOrBreakoutRoom: "Table 2",
      requestTime: "2026-10-26T13:30:00",
      explanation: "Having trouble writing unit tests.",
      solved: true,
    },
    {
      id: 4,
      requesterEmail: "student3@ucsb.edu",
      teamId: "team02-f26-08",
      tableOrBreakoutRoom: "Breakout Room 3",
      requestTime: "2026-10-26T14:15:00",
      explanation: "Getting an error when connecting to the database.",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };