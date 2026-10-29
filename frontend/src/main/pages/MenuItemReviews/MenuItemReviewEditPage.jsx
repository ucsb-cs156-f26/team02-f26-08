import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import MenuItemReviewForm from "main/components/MenuItemReviews/MenuItemReviewForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function MenuItemReviewEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: review,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/menuitemreviews?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/menuitemreviews`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (review) => ({
    url: "/api/menuitemreviews",
    method: "PUT",
    params: {
      id: review.id,
    },
    data: {
      itemId: review.itemId,
      reviewerEmail: review.reviewerEmail,
      stars: review.stars,
      comments: review.comments,
      dateReviewed: review.dateReviewed,
    },
  });

  const onSuccess = (review) => {
    toast(`MenuItemReview Updated - id: ${review.id} itemId: ${review.itemId}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/menuitemreviews?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/menuitemreviews" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Menu Item Review</h1>
        {review && (
          <MenuItemReviewForm
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={review}
          />
        )}
      </div>
    </BasicLayout>
  );
}
