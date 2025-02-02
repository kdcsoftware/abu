import React, { useState } from "react";

import DateField from "fields/date/Setting";
import ImageField from "fields/image/Setting";
import RichTextField from "fields/rich-text/Setting";
import SlugField from "fields/slug/Setting";
import TextField from "fields/text/Setting";

import { useModels } from "context/models";
import { useModal } from "context/modal";
import update from "api/update";

const FieldSetting = ({ type }) => {
  const { selected: model, dispatch } = useModels();
  const { setModal } = useModal();
  const [error, setError] = useState(null);

  const updateModel = async ({ id, ...others }) => {
    const data = { id, ...others };
    return update({ apiName: "Model", id, data });
  };

  const onSubmit = async (data) => {
    if (model?.fields?.length > 0) {
      const idx = model.fields.findIndex((item) => item.id === data.id);
      if (idx >= 0) {
        setError("Field ID not unique. Please choose a different one.");
        return;
      }
    }

    try {
      const newModel = { ...model };
      if (newModel.fields) newModel.fields.push(data);
      else newModel.fields = [data];
      await updateModel(newModel);
      dispatch({ type: "UPDATE_SELECTED", payload: newModel });
      setModal(false);
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  switch (type) {
    case "date":
      return <DateField update={onSubmit} error={error} />;
    case "image":
      return <ImageField update={onSubmit} error={error} />;
    case "rich-text":
      return <RichTextField update={onSubmit} error={error} />;
    case "slug":
      return <SlugField update={onSubmit} error={error} />;
    case "text":
      return <TextField update={onSubmit} error={error} />;
    default:
      break;
  }
  return null;
};

export default FieldSetting;
