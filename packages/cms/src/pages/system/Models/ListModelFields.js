import React, { useState, useEffect } from "react";
import { CButton } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { useModels } from "context/models";
import { useModal } from "context/modal";
import ViewModelField from "./ViewModelField";

const ListModelFields = () => {
  const { selected } = useModels();
  const { setModal } = useModal();
  const [fields, setFields] = useState([]);

  useEffect(() => {
    if (selected?.fields) setFields(selected.fields);
    else setFields([]);
  }, [selected, setFields]);

  if (fields.length === 0) {
    return (
      <div className="text-center">
        <h3>Add fields to this model!</h3>
        <p>
          Fields are columns in your spreadsheets. They define the data type in
          your model.
        </p>
        <CButton
          type="button"
          id="addField"
          color="primary"
          onClick={() => setModal("addModelField")}
        >
          <CIcon name="cil-plus" />
          Add Field
        </CButton>
      </div>
    );
  }
  return (
    <div>
      {fields.map((f) => (
        <ViewModelField key={f.id} {...f} />
      ))}
    </div>
  );
};

export default ListModelFields;