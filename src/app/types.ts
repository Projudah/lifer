export type ReclaimTask = {
    id: string;
    title: string;
    timeChunksRequired: number;
}

export type GoalType = {
    name: string;
    steps: Step[];
}

export type Goals = {
    [key: string]: GoalType;
  };

export type Step = {
    name: string;
    tasks: Task[];
}

export type Task = {
    id?: string;
    title: string;
    eventColor: string | null;
    eventCategory: string;
    timeChunksRequired: number | string;
    minChunkSize: number;
    maxChunkSize: number;
    notes?: string;
    alwaysPrivate: boolean;
    timeSchemeId: string;
    priority: string;
    snoozeUntil: string | null;
    due: string;
    onDeck: boolean;
    status?: string;
    finished?: string;
}

// { name: "Shoot a Video in a Local Restaurant", steps: [{ name: "Pre-Production", tasks: [{ title: "Define the purpose and concept of the video", timeChunksRequired: "30 minutes" }, { title: "Identify the target audience", timeChunksRequired: "15 minutes" }, { title: "Create a storyboard", timeChunksRequired: "1 hour" }, { title: "Write a script", timeChunksRequired: "1 hour" }, { title: "Scout local restaurants for filming", timeChunksRequired: "2 hours" }, { title: "Get permission from the restaurant manager", timeChunksRequired: "30 minutes" }, { title: "Make a list of required equipment", timeChunksRequired: "15 minutes" }, { title: "Hire or assemble a crew (if needed)", timeChunksRequired: "1 hour" }, { title: "Plan the shooting schedule", timeChunksRequired: "30 minutes" }] }, { name: "Production", tasks: [{ title: "Set up equipment in the restaurant", timeChunksRequired: "1 hour" }, { title: "Conduct a brief rehearsal with crew and actors (if any)", timeChunksRequired: "30 minutes" }, { title: "Shoot the opening scenes", timeChunksRequired: "1 hour" }, { title: "Film the main content of the video", timeChunksRequired: "2-3 hours" }, { title: "Capture any necessary B-roll footage", timeChunksRequired: "1 hour" }, { title: "Record voice-over (if needed)", timeChunksRequired: "30 minutes" }] }, { name: "Post-Production", tasks: [{ title: "Transfer footage to the editing software", timeChunksRequired: "30 minutes" }, { title: "Edit the video", timeChunksRequired: "3-4 hours" }, { title: "Add music and sound effects", timeChunksRequired: "1 hour" }, { title: "Include graphics or text overlays", timeChunksRequired: "1 hour" }, { title: "Review and make necessary adjustments", timeChunksRequired: "1 hour" }, { title: "Export the final video", timeChunksRequired: "30 minutes" }, { title: "Share the video on designated platforms", timeChunksRequired: "30 minutes" }] }] }

// {
//     "title": "test 2",
//     "eventColor": null,
//     "eventCategory": "WORK",
//     "timeChunksRequired": 4,
//     "minChunkSize": 4,
//     "maxChunkSize": 4,
//     "notes": "notes sections",
//     "alwaysPrivate": true,
//     "timeSchemeId": "33c760f8-bdc6-4239-943f-d116a68dfb63",
//     "priority": "P3",
//     "snoozeUntil": null,
//     "due": "2024-05-10T03:00:00.000Z",
//     "onDeck": false
//   }

// {
//     "title": "test task",
//     "eventColor": null,
//     "eventCategory": "PERSONAL",
//     "timeChunksRequired": 1,
//     "minChunkSize": 1,
//     "maxChunkSize": 2,
//     "alwaysPrivate": true,
//     "timeSchemeId": "14c1749f-d0e0-4ab4-9c97-ca02e7fa212c",
//     "priority": "P3",
//     "snoozeUntil": null,
//     "due": "2024-07-12T03:00:00.000Z",
//     "onDeck": false
//   }