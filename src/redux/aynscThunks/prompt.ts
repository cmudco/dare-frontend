import { createAsyncThunk } from "@reduxjs/toolkit";
import { Prompt } from "../types/prompt";

export const fetchPrompts = createAsyncThunk("prompt/fetchPrompts", async (_, thunkAPI) => {
  try {
    // Simulate API call to fetch prompts
    const dummyPrompts: Prompt[] = [
      { id: "prompt_1", title: "Greeting", dateCreated: new Date().toISOString() },
      { id: "prompt_2", title: "Help", dateCreated: new Date().toISOString() },
      { id: "prompt_3", title: "Question", dateCreated: new Date().toISOString() },
      { id: "prompt_4", title: "Feedback", dateCreated: new Date().toISOString() },
      { id: "prompt_5", title: "Suggestion", dateCreated: new Date().toISOString() },
      { id: "prompt_6", title: "Complaint", dateCreated: new Date().toISOString() },
      { id: "prompt_7", title: "Compliment", dateCreated: new Date().toISOString() },
      { id: "prompt_8", title: "Inquiry", dateCreated: new Date().toISOString() },
      { id: "prompt_9", title: "Request", dateCreated: new Date().toISOString() },
      { id: "prompt_10", title: "Report", dateCreated: new Date().toISOString() }
    ];
    return dummyPrompts;
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message);
  }
});
