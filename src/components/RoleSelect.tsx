import { Select, Option } from "@material-tailwind/react";
import { useFormikContext } from "formik";
import { SignupFormValues } from "../pages/Registration/validation";

const RoleSelectionScreen: React.FC = () => {
  const { setFieldValue, values } = useFormikContext<SignupFormValues>();
  return (
    <div className="mb-5">
      <Select
        label="Select Role"
        name="role"
        value={values.role}
        onChange={(value) => {
          setFieldValue("role", value || "");
        }}
      >
        <Option value="student">Student</Option>
        <Option value="professor">Professor</Option>
      </Select>
    </div>
  );
}

export default RoleSelectionScreen;