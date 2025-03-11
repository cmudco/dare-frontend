import { useFormikContext } from "formik";
import { SignupFormValues } from "../pages/Registration/validation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./UI/select";

const RoleSelectionScreen: React.FC = () => {
  const { setFieldValue, values } = useFormikContext<SignupFormValues>();

  return (
    <div className="mb-5">
      <Select
        value={values.role}
        onValueChange={(value) => setFieldValue("role", value || "")}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="professor">Professor</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoleSelectionScreen;
