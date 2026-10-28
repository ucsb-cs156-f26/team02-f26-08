import React from "react";
import ArticleForm from "main/components/Articles/ArticleForm";
import { ArticlesFixtures } from "fixtures/ArticlesFixtures";

export default {
  title: "components/Articles/ArticleForm",
  component: ArticleForm,
};

const Template = (args) => {
  return <ArticleForm {...args} />;
};

export const Create = Template.bind({});

Create.args = {
  buttonLabel: "Create",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};

export const Update = Template.bind({});

Update.args = {
  initialContents: ArticlesFixtures.oneDate,
  buttonLabel: "Update",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};
