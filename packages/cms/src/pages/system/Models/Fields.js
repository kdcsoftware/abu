import React from "react";
import { CCard, CCardBody, CCardHeader } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { Link } from "react-router-dom";
import { useList, ListProvider } from "context/list";
import Info from "./Info";
import FieldList from "./FieldList";

const Fields = () => {
  const { selected } = useList();

  if (!selected) return <Info />;

  return (
    <CCard>
      <CCardHeader>
        <span id="listTitle" className="h3">
          {selected.name}
        </span>
        <div className="card-header-actions">
          <Link
            id="addmodel"
            to={`/system/models/add`}
            className="btn btn-info btn-sm float-right"
          >
            <CIcon name="cil-pencil" /> Edit Model
          </Link>
        </div>
      </CCardHeader>
      <CCardBody>
        <ListProvider>
          <FieldList />
        </ListProvider>
        <Link
          id="addmodel"
          to={`/system/models/add`}
          className="btn btn-success float-right"
        >
          <CIcon name="cil-plus" /> Add another field
        </Link>
      </CCardBody>
    </CCard>
  );
};

export default Fields;
