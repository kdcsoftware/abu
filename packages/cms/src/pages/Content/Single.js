import React, { useState, useEffect } from "react";
import { CCard, CCardBody, CCardHeader, CButton } from "@coreui/react";
import { useForm, FormProvider } from "react-hook-form";
import FieldEdit from "components/FieldEdit";
import { useModels } from "context/models";
import { useData } from "context/data";
import { useToaster } from "context/toaster";

import uploadImage from "fields/image/submit";

import create from "api/create";
import get from "api/get";

const Single = () => {
  const { selected: model } = useModels();
  const { setData } = useData();
  const { addToast } = useToaster();
  const methods = useForm();
  const [error, setError] = useState(null);

  const createSingle = async ({ data }) =>
    create({
      apiName: "Content",
      path: `/${model.id}`,
      data: {
        id: model.id,
        data,
      },
    });

  const submitImages = async (data) => {
    const fields = model.fields.filter((f) => f.type === "image");
    const proms = [];
    for (let idx = 0; idx < fields.length; idx += 1) {
      const key = fields[idx].id;
      proms.push(uploadImage({ model, file: data[key] }));
    }
    await Promise.all(proms);
  };

  const onSubmit = async (data) => {
    try {
      await submitImages(data);
      await createSingle({ data });
      addToast({
        message: `${model.name} saved successfully!`,
        color: "success",
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    let cancel = false;
    const getUser = async () => {
      try {
        const res = await get({
          apiName: "Content",
          path: `/${model.id}/`,
          id: model.id,
        });
        if (cancel) return;
        setData(res);
      } catch (e) {
        setData({});
      }
    };

    if (model?.id) getUser();
    else setData({});
    return () => {
      cancel = true;
    };
  }, [model, setData]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} autoComplete="off">
        <CCard>
          <CCardHeader>
            <span id="singleTitle" className="h3 mb-0">
              Editing {model.name}
            </span>
            <div className="card-header-actions">
              <CButton type="submit" color="primary" block>
                Save
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {error && (
              <div className="text-danger font-weight-bold">{error}</div>
            )}
            {model?.fields?.map((field) => (
              <FieldEdit key={field.id} {...field} />
            ))}
          </CCardBody>
        </CCard>
      </form>
    </FormProvider>
  );
};

export default Single;
