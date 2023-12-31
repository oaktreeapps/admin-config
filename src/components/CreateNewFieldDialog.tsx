import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { KitConfigField } from "../schema";
import { useEffect, useState } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import { widgets } from "../constants";
import { resourcesAtom } from "../atoms";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

interface Props {
  editField?: KitConfigField;
  setEditField: (field: KitConfigField | undefined) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const defaultFieldValue: KitConfigField = {
  name: "",
  inline: false,
  tableDisplay: false,
  widget: "InputText",
  options: [],
  required: false,
  unique: false,
};

export default function CreateNewFieldDialog({ editField, setEditField, visible, setVisible }: Props) {
  const params = useParams();

  const [resources, setResources] = useRecoilState(resourcesAtom);

  const resource = resources[params.resource as string];

  const [field, setField] = useState<KitConfigField>(defaultFieldValue);

  const closeDialog = () => {
    setVisible(false);
    setField(defaultFieldValue);
    setEditField(undefined);
  };

  const saveField = () => {
    setResources((resources) => {
      const newCrudFields: any[] = [];

      resource.crudFields.forEach((crudField) => {
        if (crudField.name === editField?.name) {
          newCrudFields.push(field);
        } else {
          newCrudFields.push(crudField);
        }
      });

      return {
        ...resources,
        [params.resource as string]: {
          ...resource,
          crudFields: newCrudFields,
        },
      };
    });

    closeDialog();
  };

  const createField = () => {
    setResources((resources) => ({
      ...resources,
      [params.resource as string]: {
        ...resource,
        crudFields: [...(resource.crudFields || []), field],
      },
    }));

    closeDialog();
  };

  useEffect(() => {
    if (editField) setField(editField);
  }, [editField]);

  const onWidgetChangeHandle = (e: any) => {
    setField((field) => ({ ...field, widget: e.value }))
    if(["RadioButton", "MultiSelect", "Dropdown"].includes(e.value)){
      setField((field) => ({ ...field, options: [...field.options, { name: "", value: "" }] }))
    }
  }

  const removeOption = (index: number) => {
    console.log(index)
    let data = [...field.options];
    data.splice(index, 1);
    setField((field) => ({ ...field, options: data }))
  }

  return (
    <Dialog
      header={editField ? `Edit field '${editField?.name}'` : "Add New Field"}
      visible={visible}
      className="w-7"
      onHide={closeDialog}
      footer={
        <div>
          <Button label="Cancel" icon="pi pi-times" onClick={closeDialog} className="p-button-text" />
          <Button
            disabled={!field.name.length}
            label="Save"
            icon="pi pi-check"
            onClick={editField ? saveField : createField}
            autoFocus
            severity="success"
          />
        </div>
      }
    >
      <p className="font-bold">Field Name</p>
      <InputText
        className="w-full mb-5"
        value={field.name}
        onChange={(e) => setField((field) => ({ ...field, name: e.target.value.trim() }))}
        placeholder="profilePic, firstName, lastName, etc."
      />

      <div className="w-full flex align-items-center">
        <p className="font-bold mr-3">Is Inline</p>
        <InputSwitch
          tooltip="Turning this on will make the field appear in the same row as the subsequent fields marked as inline in the web app."
          tooltipOptions={{ position: "right" }}
          checked={field.inline}
          onChange={(e) => setField((field) => ({ ...field, inline: !!e.value }))}
        />
      </div>

      <div className="w-full flex align-items-center">
        <p className="font-bold mr-3">Is Required</p>
        <InputSwitch
          checked={field.required}
          onChange={(e) => setField((field) => ({ ...field, required: !!e.value }))}
        />
      </div>

      <div className="w-full flex align-items-center">
        <p className="font-bold mr-3">Is Unique</p>
        <InputSwitch
          checked={field.unique}
          onChange={(e) => setField((field) => ({ ...field, unique: !!e.value }))}
        />
      </div>

      <div className="w-full flex align-items-center">
        <p className="font-bold mr-3">Table Display</p>
        <InputSwitch
          tooltip="Turning this on will make the field appear in the data table in the web app."
          tooltipOptions={{ position: "right" }}
          checked={field.tableDisplay}
          onChange={(e) => setField((field) => ({ ...field, tableDisplay: !!e.value }))}
        />
      </div>

      <p className="font-bold">Widget</p>
      <Dropdown
        filter
        className="w-full"
        value={field.widget}
        options={widgets}
        onChange={(e) => onWidgetChangeHandle(e)}
      />

      {["RadioButton", "MultiSelect", "Dropdown"].includes(field.widget || "") && (
        <>
          <p className="font-bold">Options</p>
          <div>
            {field.options.length > 0 ?
            <div className="w-full flex flex-row gap-3">
              <div className="w-full">
                <p>Name</p>
              </div>
              <div className="w-full">
                <p>Value</p>
              </div>
              <div className="w-auto">
              </div>
            </div> : null }

            {field.options.map((option, index) => (
              <div className="w-full flex flex-row gap-3" key={index}>
                <div className="w-full">
                  <InputText
                    value={option.name}
                    onChange={(e) => {
                      const newOptions = [...field.options];
                      newOptions[index].name = e.target.value;

                      setField((field) => ({ ...field, options: newOptions }));
                    }}
                    placeholder="New York"
                    className="w-full mb-3"
                  />
                </div>
                <div className="w-full">
                  <InputText
                    value={option.value}
                    onChange={(e) => {
                      const newOptions = [...field.options];
                      newOptions[index].value = e.target.value;

                      setField((field) => ({ ...field, options: newOptions }));
                    }}
                    placeholder="NY"
                    className="w-full mb-3"
                  />
                </div>
                <div className="w-auto">
                  <Button
                      icon="pi pi-trash"
                      severity={"danger"}
                      outlined
                      onClick={() =>removeOption(index)}
                      />
                </div>
              </div>
            ))}

            <div>
              <Button
                label="Add New Option"
                icon="pi pi-plus"
                severity={"secondary"}
                outlined
                onClick={() =>
                  setField((field) => ({ ...field, options: [...field.options, { name: "", value: "" }] }))
                }
              />
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
