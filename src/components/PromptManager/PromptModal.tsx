import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { createPrompt, updatePrompt,  } from "../../redux/aynscThunks/prompt";
import { clearSelectedPrompt, closeModal } from "../../redux/promptSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "../UI/dialog";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Label } from "../UI/label";
import { Textarea } from "../UI/textarea";
import { Formik, Form } from "formik";
import * as Yup from "yup";

const promptValidationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  content: Yup.string().required("Content is required"),
});

const PromptUploadModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedPrompt, loading, isModalOpen } = useSelector(
    (state: RootState) => state.prompt
  );
  const isEditMode = !!selectedPrompt;

  const initialValues = {
    title: selectedPrompt?.title || "",
    content: selectedPrompt?.content || "",
  };

  const handleClose = () => {
    dispatch(closeModal());
    if (selectedPrompt) {
      dispatch(clearSelectedPrompt());
    }
  };

  const handleSubmit = async (values: { title: string; content: string }) => {
    try {
      if (isEditMode && selectedPrompt?.id) {
        await dispatch(
          updatePrompt({
            id: selectedPrompt.id,
            promptData: {
              title: values.title,
              content: values.content,
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          createPrompt({
            title: values.title,
            content: values.content,
          })
        ).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save prompt:", error);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-6 mx-auto w-[90vw] max-w-md bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEditMode ? "Edit Prompt" : "Create New Prompt"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {isEditMode
              ? "Update your prompt details below."
              : "Fill in the details to create a new prompt."}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={promptValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            isValid,
            dirty,
          }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Prompt Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  placeholder="Enter prompt title"
                  className={
                    errors.title && touched.title ? "border-red-500" : ""
                  }
                />
                {errors.title && touched.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Prompt Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={values.content}
                  onChange={handleChange}
                  placeholder="Enter prompt content"
                  className={`min-h-[150px] ${errors.content && touched.content ? "border-red-500" : ""
                    }`}
                />
                {errors.content && touched.content && (
                  <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                )}
              </div>

              <DialogFooter className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!(isValid && dirty) || loading}>
                  {loading ? "Saving..." : isEditMode ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default PromptUploadModal;