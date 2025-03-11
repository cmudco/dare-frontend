import React from 'react';

const PromptUploadModal: React.FC = () => {


  return (
    <></>
    // <Dialog
    //   open={isModalOpen}
    //   handler={() => dispatch(closeModal())}
    //   size="sm"
    //   className="p-8 mx-auto shadow-md rounded-2xl xl:w-[40vw] lg:w-[50vw] md:w-[60vw] w-[80vw] flex flex-col items-center justify-center relative xl:min-h-[55vh] min-h-[50vh]"
    // >
    //   <DialogHeader>
    //     <Typography variant="h5" className="text-center">
    //       Edit File Upload
    //     </Typography>
    //   </DialogHeader>
    //   <DialogBody
    //     className="space-y-6 w-full"
    //     onDrop={handleDrop}
    //     onDragOver={handleDragOver}
    //   >
    //     <Input
    //       label="File Name"
    //       value={filename}
    //       className="w-full"
    //       onChange={(e) => dispatch(updateFilename(e.target.value))}
    //       crossOrigin={false}
    //     />

    //     <div className="flex flex-col gap-2">
    //       <Select
    //         label="Add Tags"
    //         onChange={(value) => {
    //           if (value) {
    //             dispatch(updateTagChange(parseInt(value)));
    //           }
    //         }}
    //       >
    //         {availableTags.map((tag) => (
    //           <Option key={tag} value={tag}>
    //             {tag}
    //           </Option>
    //         ))}
    //       </Select>
    //       <div className="flex flex-wrap gap-2">
    //         {selectedTags.map((tag) => (
    //           <Chip
    //             key={tag}
    //             value={tag}
    //             onClose={() => dispatch(updateRemoveTag(tag))}
    //             className="bg-yellow-100 text-yellow-600"
    //           />
    //         ))}
    //       </div>
    //     </div>

    //     <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center bg-blue-50 hover:bg-blue-100 transition cursor-pointer">
    //       <div
    //         onClick={() => document.getElementById("fileInput")?.click()}
    //         className="font-medium"
    //       >
    //         Drop your files here or <span className="text-blue-600">browse</span>
    //       </div>
    //       <input
    //         id="fileInput"
    //         type="file"
    //         multiple
    //         onChange={handleFileChange}
    //         className="hidden"
    //       />
    //       <Typography variant="small" className="mt-2 text-gray-500">
    //         Maximum size: 1 MB
    //       </Typography>
    //     </div>
    //   </DialogBody>
    //   <DialogFooter className="flex justify-end space-x-2 p-4">
    //     <Button color="gray" onClick={() => dispatch(closeModal())}>
    //       Cancel
    //     </Button>
    //     <Button className="bg-primary" onClick={handleUploadClick}>
    //       Save
    //     </Button>
    //   </DialogFooter>
    // </Dialog>
  );
};

export default PromptUploadModal;