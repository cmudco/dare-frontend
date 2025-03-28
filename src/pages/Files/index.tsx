import FileManagerLayout from "../../components/FileManager/FileManagerLayout";

const Files = () => {
  return (

    <div className="flex flex-col h-full">
      <div className="flex flex-col space-y-2 px-10 pt-8">
        <h1 className="text-3xl font-bold tracking-tight">Files</h1>
      </div>

      <FileManagerLayout />;
    </div>
  )

};

export default Files;
