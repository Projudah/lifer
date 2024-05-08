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
    id: string;
    title: string;
    eventColor: string | null;
    eventCategory: string;
    timeChunksRequired: number;
    minChunkSize: number;
    maxChunkSize: number;
    notes: string;
    alwaysPrivate: boolean;
    timeSchemeId: string;
    priority: string;
    snoozeUntil: string | null;
    due: string;
    onDeck: boolean;
}

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