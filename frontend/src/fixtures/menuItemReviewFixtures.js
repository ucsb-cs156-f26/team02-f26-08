const menuItemReviewFixtures = {
  oneReiview: {
    id: 2,
    itemId: 1,
    reviewerEmail: "kyleli@ucsb.edu",
    stars: 1,
    comments: "this sucks",
    dateReviewed: "2026-10-26T14:30:00",
  },
  threeReviews: [
    {
      id: 2,
      itemId: 1,
      reviewerEmail: "kyleli@ucsb.edu",
      stars: 1,
      comments: "this sucks",
      dateReviewed: "2026-10-26T14:30:00",
    },
    {
      id: 3,
      itemId: 33,
      reviewerEmail: "kyleli@ucsb.edu",
      stars: 5,
      comments: "this is amazing",
      dateReviewed: "2026-10-26T14:30:00",
    },
    {
      id: 4,
      itemId: 44,
      reviewerEmail: "kyleli@ucsb.edu",
      stars: 3,
      comments: "alright",
      dateReviewed: "2026-10-26T14:30:00",
    },
  ],
};

export { menuItemReviewFixtures };
