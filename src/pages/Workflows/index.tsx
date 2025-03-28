import WorkflowManagerLayout from "../../components/WorkflowManager/WorkflowManagerLayout";

const Workflows = () => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col space-y-2 px-10 pt-8">
                <h1 className="text-3xl font-bold tracking-tight">Multi-Agent Workflow</h1>
                <p className="text-muted-foreground">
                    Workflow includes the prompts. You can select multiple prompts to define steps for workflow
                </p>
            </div>

            <WorkflowManagerLayout />
        </div>
    );
};

export default Workflows;
