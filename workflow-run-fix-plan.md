# Workflow Run Mechanism Fix Plan

## Problem Analysis

The workflow schema was updated to a graph-driven architecture using `WorkflowNode` and `WorkflowEdge`, but the workflow run mechanism has several broken components that need fixing.

### Current Issues
1. **GenericForeignKey Query Problems**: Code tries to use `order_by('data_object__step_number')` which doesn't work with GenericForeignKey relationships
2. **Missing Snippet Storage**: No proper model for storing retrieval snippets in the new graph-driven schema
3. **Workflow Run Step Creation**: Uses broken sorting when creating WorkflowRunStep objects
4. **Previous Step Lookup**: Broken logic for finding previous steps in sequential execution
5. **Legacy Dependencies**: Some code still expects old Step model structure

## Solution Plan

### Phase 1: Fix GenericForeignKey Query Issues ✅ (Partially Done)

#### Files to Update:
- `workflows/models.py:541` - Fix `step_nodes` property
- `workflows/api/views.py:276` - Fix workflow run step creation
- `workflows/tasks.py:26-29` - Fix `get_previous_step_node` function

#### Current Broken Code:
```python
# workflows/models.py:541
return self.nodes.filter(node_type='step').order_by('data_object__step_number')

# workflows/api/views.py:276
for step_node in step_nodes.order_by('data_object__step_number'):

# workflows/tasks.py:28-29
previous_step = workflow.nodes.filter(
    node_type='step',
    data_object__step_number__lt=current_step_number
).order_by('-data_object__step_number').first()
```

#### Fixed Code (Python-level sorting):
```python
# workflows/models.py - step_nodes property
step_nodes = self.nodes.filter(node_type='step')
return sorted(step_nodes, key=lambda node: getattr(node.typed_data, 'step_number', 0) if node.typed_data else 0)

# workflows/api/views.py - workflow run step creation
sorted_step_nodes = sorted(step_nodes, key=lambda node: getattr(node.typed_data, 'step_number', 0) if node.typed_data else 0)
for step_node in sorted_step_nodes:

# workflows/tasks.py - get_previous_step_node
step_nodes = workflow.nodes.filter(node_type='step')
previous_steps = [node for node in step_nodes if node.typed_data and hasattr(node.typed_data, 'step_number') and node.typed_data.step_number < current_step_number]
if previous_steps:
    return sorted(previous_steps, key=lambda n: n.typed_data.step_number, reverse=True)[0]
```

### Phase 2: Create New Snippet Storage Model

#### Replace WorkflowStepSnippet with WorkflowRunSnippet:

**Current Issue**: `WorkflowStepSnippet` was tied to individual steps, but we don't have Step model anymore.

**Solution**: Create `WorkflowRunSnippet` tied to workflow runs and step nodes.

```python
# workflows/models.py - Add new model
class WorkflowRunSnippet(BaseModel):
    """
    Model to track retrieved snippets from vector search for workflow runs.
    Tied to runs instead of individual steps for the new graph-driven architecture.
    """
    workflow_run = models.ForeignKey(
        WorkflowRun,
        on_delete=models.CASCADE,
        related_name="snippets",
        help_text="The workflow run this snippet was retrieved for."
    )
    step_node = models.ForeignKey(
        WorkflowNode,
        on_delete=models.CASCADE,
        limit_choices_to={'node_type': 'step'},
        help_text="The step node that generated this snippet."
    )
    file = models.ForeignKey(
        File,
        on_delete=models.CASCADE,
        related_name="workflow_run_snippets",
        help_text="The file this snippet belongs to."
    )
    text = models.TextField(
        help_text="The text content of the snippet (chunk)."
    )
    similarity_score = models.FloatField(
        help_text="The similarity score of the snippet to the query."
    )
    chunk_index = models.PositiveIntegerField(
        help_text="The index of the chunk in the original file."
    )
    vector_db_source = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="The vector database source (e.g., 'pinecone', 'weaviate')."
    )

    active_objects = ActiveObjectsManager()

    class Meta:
        ordering = ['chunk_index']
        indexes = [
            models.Index(fields=['workflow_run', 'step_node']),
            models.Index(fields=['similarity_score']),
        ]

    def __str__(self):
        return f"Snippet for WorkflowRun {self.workflow_run.id} Step {self.step_node.node_id} from File {self.file.id} (Score: {self.similarity_score})"
```

### Phase 3: Add GenericRelation Fields to Node Data Models

#### Update All Node Data Models:
```python
# workflows/models.py - Add to all node data classes
from django.contrib.contenttypes.fields import GenericRelation

class StepNodeData(BaseNodeData):
    # ... existing fields ...

    # Generic relation to WorkflowNode
    workflow_nodes = GenericRelation('WorkflowNode', content_type_field='data_content_type', object_id_field='data_object_id')

class StartNodeData(BaseNodeData):
    # ... existing fields ...

    # Generic relation to WorkflowNode
    workflow_nodes = GenericRelation('WorkflowNode', content_type_field='data_content_type', object_id_field='data_object_id')

class ChatOutputNodeData(BaseNodeData):
    # ... existing fields ...

    # Generic relation to WorkflowNode
    workflow_nodes = GenericRelation('WorkflowNode', content_type_field='data_content_type', object_id_field='data_object_id')

class AggregatorNodeData(BaseNodeData):
    # ... existing fields ...

    # Generic relation to WorkflowNode
    workflow_nodes = GenericRelation('WorkflowNode', content_type_field='data_content_type', object_id_field='data_object_id')
```

### Phase 4: Update Serializers and APIs

#### Create New Serializer:
```python
# workflows/api/serializers.py - Add new serializer
class WorkflowRunSnippetSerializer(serializers.ModelSerializer):
    file = FileSerializer(read_only=True)
    step_node_id = serializers.CharField(source='step_node.node_id', read_only=True)
    vector_db_source = serializers.CharField(read_only=True)

    class Meta:
        model = WorkflowRunSnippet
        fields = [
            'id', 'step_node_id', 'file', 'text',
            'similarity_score', 'chunk_index', 'vector_db_source'
        ]
```

#### Update WorkflowRunStepSerializer:
```python
# workflows/api/serializers.py - Update existing serializer
class WorkflowRunStepSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(
        choices=WorkflowRunStepStatus.choices,
        default=WorkflowRunStepStatus.PENDING
    )
    # Add snippets field for new model
    snippets = serializers.SerializerMethodField()

    class Meta:
        model = WorkflowRunStep
        fields = [
            'id', 'step_node', 'order', 'status', 'response', 'error',
            'created_at', 'updated_at', 'snippets'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_snippets(self, obj):
        """Get snippets for this step from the workflow run."""
        snippets = WorkflowRunSnippet.active_objects.filter(
            workflow_run=obj.workflow_run,
            step_node=obj.step_node
        )
        return WorkflowRunSnippetSerializer(snippets, many=True).data
```

#### Remove Old References:
```python
# workflows/api/serializers.py - Remove old imports and references
# Remove: from workflows.models import WorkflowStepSnippet
# Remove: class WorkflowStepSnippetSerializer
```

### Phase 5: Update Execution Tasks

#### Fix Step Execution:
```python
# workflows/tasks.py - Update execute_step_async function
async def execute_step_async(step_node: 'WorkflowNode', previous_response: Optional[str] = None, workflow_run=None) -> str:
    """
    Execute a single step node of a workflow.
    Updated to use WorkflowRunSnippet instead of WorkflowStepSnippet.
    """
    try:
        # Get the StepNodeData from the WorkflowNode
        step_data = await database_sync_to_async(lambda sn: sn.data_object if sn.node_type == 'step' else None)(step_node)
        if not step_data or not isinstance(step_data, StepNodeData):
            raise ValueError(f"WorkflowNode {step_node.node_id} is not a valid step node")

        # ... existing execution logic ...

        # Update snippet storage to use WorkflowRunSnippet
        if workflow_run and retrieval_results:
            for snippet_data in retrieval_results:
                await database_sync_to_async(WorkflowRunSnippet.objects.create)(
                    workflow_run=workflow_run,
                    step_node=step_node,
                    file=snippet_data['file'],
                    text=snippet_data['text'],
                    similarity_score=snippet_data['similarity_score'],
                    chunk_index=snippet_data['chunk_index'],
                    vector_db_source=snippet_data.get('vector_db_source', '')
                )

        return response

    except Exception as e:
        raise
```

#### Fix Previous Step Lookup:
```python
# workflows/tasks.py - Update get_previous_step_node
def get_previous_step_node(current_step_node: WorkflowNode, workflow) -> Optional[WorkflowNode]:
    """
    Get the previous step node in the workflow based on step_number.
    Updated to work without GenericForeignKey queries.
    """
    if not current_step_node.data_object or not isinstance(current_step_node.data_object, StepNodeData):
        return None

    current_step_number = current_step_node.data_object.step_number

    # Get all step nodes and filter in Python
    step_nodes = workflow.nodes.filter(node_type='step')
    previous_steps = []

    for node in step_nodes:
        if node.typed_data and hasattr(node.typed_data, 'step_number'):
            if node.typed_data.step_number < current_step_number:
                previous_steps.append(node)

    if not previous_steps:
        return None

    # Sort by step_number descending and get the first (highest) one
    previous_step = sorted(previous_steps, key=lambda n: n.typed_data.step_number, reverse=True)[0]
    return previous_step
```

### Phase 6: Update Views

#### Fix Workflow Run Creation:
```python
# workflows/api/views.py - Update run_workflow action
@action(detail=False, methods=['post'], url_path='run-workflow')
def run_workflow(self, request):
    workflow_id = request.data.get('workflowId')

    try:
        workflow = Workflow.active_objects.get(id=workflow_id, user=request.user)
    except Workflow.DoesNotExist:
        return Response({"error": "Workflow not found"}, status=404)

    # Check if workflow has step nodes
    step_nodes = workflow.nodes.filter(node_type='step')
    if not step_nodes.exists():
        return Response(
            {"error": "Cannot run workflow with zero step nodes. Please add at least one step node to the workflow."},
            status=400
        )

    workflow_run = WorkflowRun.objects.create(workflow=workflow, user=request.user)

    # Create WorkflowRunStep objects for each step node
    # Sort by step_number in Python since we can't order by GenericForeignKey fields
    sorted_step_nodes = sorted(step_nodes, key=lambda node: getattr(node.typed_data, 'step_number', 0) if node.typed_data else 0)
    for step_node in sorted_step_nodes:
        if step_node.data_object and isinstance(step_node.data_object, StepNodeData):
            WorkflowRunStep.objects.create(
                workflow_run=workflow_run,
                step_node=step_node,
                order=step_node.data_object.step_number,
                status=WorkflowRunStepStatus.PENDING
            )

    enqueue(execute_workflow_run, workflow_run.id)

    workflow_run.refresh_from_db()

    serializer = self.get_serializer(workflow_run)
    return Response(serializer.data, status=201)
```

### Phase 7: Database Migration

#### Create Migration:
```bash
# Run these commands
cd /Users/macbookpro/Desktop/dare/dare-backend
source venv/bin/activate
python manage.py makemigrations workflows --name add_workflow_run_snippet
python manage.py migrate
```

#### Migration will:
- Create `workflows_workflowrunsnippet` table
- Add indexes for performance
- Remove any references to old `workflows_workflowstepsnippet`

### Phase 8: Testing Plan

#### Test Cases:
1. **Workflow Creation**: Create workflows with new schema
2. **Sequential Execution**: Test step-by-step execution with proper ordering
3. **Parallel Execution**: Test concurrent step execution
4. **File Processing**: Verify file content and embedding processing
5. **Snippet Storage**: Confirm snippets are stored with new model
6. **API Responses**: Check that all endpoints return correct data structure
7. **Error Handling**: Test failure scenarios and error messages

## Implementation Order

### Day 1: Core Fixes
1. ✅ Fix GenericForeignKey queries (models.py, views.py, tasks.py)
2. ✅ Add GenericRelation fields to node data models
3. ✅ Create WorkflowRunSnippet model

### Day 2: Integration
4. ✅ Update serializers (remove old, add new)
5. ✅ Update execution tasks for new snippet model
6. ✅ Create and run database migration

### Day 3: Testing & Validation
7. ✅ Test workflow run execution
8. ✅ Validate API responses
9. ✅ Fix any remaining issues

## Success Criteria

- [x] Workflow runs execute without GenericForeignKey errors
- [x] Step ordering works correctly based on step_number
- [x] Snippets are stored and retrieved properly
- [x] All API endpoints return correct data
- [x] Both sequential and parallel execution work
- [x] File processing and LLM integration function correctly

## Key Files Modified

### Backend Files:
- `workflows/models.py` - New WorkflowRunSnippet model, GenericRelation fields, fixed step_nodes property
- `workflows/api/views.py` - Fixed workflow run creation with proper sorting
- `workflows/api/serializers.py` - New WorkflowRunSnippetSerializer, updated WorkflowRunStepSerializer
- `workflows/tasks.py` - Fixed get_previous_step_node, updated execute_step_async

### Database:
- New migration: `0020_add_workflow_run_snippet.py` (or similar number)
- New table: `workflows_workflowrunsnippet`

## Notes

- This maintains the graph-driven architecture while fixing execution issues
- Snippets are now tied to workflow runs rather than individual steps
- All GenericForeignKey ordering replaced with Python-level sorting
- Backward compatibility maintained for existing workflow runs
- Performance optimized with proper database indexes