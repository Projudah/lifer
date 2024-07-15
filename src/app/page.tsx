"use client"

import { useRouter } from "next/navigation";
import Button from "./components/Button/Button";
import Layout from "./components/Layout/Layout";
import { useContext, useEffect, useMemo, useState } from "react";
import { DataContext } from "./dataContext";
import Goal from "./components/Goal";
import GoalModal from "./components/Goal/GoalModal";
import { GoalType, Goals, Task } from "./types";
import TaskModal from "./components/Task/TaskModal";
import Modal from "./components/Modal";
import { ProgressBar } from "./components/Goal/Goal";
import Calendar from "react-calendar";

function Square({ value }: { value: string }) {
  // a function that takes value, from 0-8 interpolate between red #a33c3c to green #0f7136
  function interpolateColor(value: number) {
    const red = 163 - (value * 20);
    const green = 55 + (value * 20);
    return `rgb(${red}, ${green}, 54)`;
  }

  return (
    <div className="square" style={{ backgroundColor: interpolateColor(Number(value)) }}>
      {value}
    </div>
  );

}


export default function Home() {
  const router = useRouter();
  const { points, goals: initialGoals, tasks } = useContext(DataContext);
  const [goals, setGoals] = useState<Goals>(initialGoals);
  const [currentGoal, setCurrentGoal] = useState<GoalType | undefined>(undefined);
  const [modalState, setModalState] = useState<string>();
  const [response, setResponse] = useState<string>();
  const [progress, setProgress] = useState<number>(0);
  const [today, setToday] = useState<Date>(new Date());
  const [dateScoreMap, setDateScoreMap] = useState<Map<string, Task[]>>(new Map());
  const completedTasks = useMemo(() => {
    return Object.values(tasks).filter((task: Task) => task.status === "COMPLETE" || task.status === "ARCHIVED");
  }, [tasks]);


  useEffect(() => {
    if (initialGoals) {
      setGoals(initialGoals);
    }
  }, [initialGoals]);

  useEffect(() => {
    const dateScoreMap = new Map<string, Task[]>();
    completedTasks.forEach((task) => {
      if (task.finished) {
        // Convert the finished date to a Date object
        const localDate = new Date(task.finished);
        // Convert to UTC string in 'YYYY-MM-DD' format for consistent key usage
        const utcDateString = localDate.toISOString().split('T')[0];
        // Use this string as the map key
        const scoreList = dateScoreMap.get(utcDateString) || [];
        const updatedScoreList = [...scoreList, task];
        dateScoreMap.set(utcDateString, updatedScoreList);
      }
    });
    setDateScoreMap(dateScoreMap);
  }, [completedTasks]);


  const sortGoals = (goals: Goals) => {
    return Object.values(goals).sort((a, b) => a.name.localeCompare(b.name));
  }

  const goalsMarkup = goals && sortGoals(goals).map((goalObject) => {
    return <Goal key={goalObject.name} name={goalObject.name} steps={goalObject.steps} />;
  });
  const pointsMarkup = <h1>{points ? points : 'loading'} pts</h1>

  const handleEarn = () => router.push("/earn");

  const handleUse = () => router.push("/use");

  const handleCloseGoalModal = () => setModalState(undefined);

  const handleOpenGoalModal = () => setModalState("goal");

  // function that converts time string '15 minutes', '30 minutes', '1 hour', '2 hours' to chunks of 15 minutes e.g 1 hour = 4 chunks
  const convertTimeToChunks = (time: string) => {
    // check if time is already in chunks and return eg time = '4'
    if (!isNaN(parseInt(time))) {
      return time;
    }

    const timeArray = time.split(' ');
    const timeValue = parseInt(timeArray[0]);
    const timeUnit = timeArray[1];
    let chunks = 0;
    switch (timeUnit) {
      case 'minutes':
        chunks = timeValue / 15;
        break;
      case 'hour':
      case 'hours':
        chunks = timeValue * 4;
        break;
      default:
        chunks = 2;
    }
    return chunks;
  }

  // function sanitize goal that takes a goal and verify all tasks have the required values
  const sanitizeGoal = (goal: GoalType) => {
    const sanitizedGoal = {
      ...goal,
      steps: goal.steps.map((step, stepIndex) => {
        const sanitizedTasks = step.tasks.map((task) => {
          const sanitizedTask = {
            ...task,
            eventColor: task.eventColor || null,
            eventCategory: task.eventCategory || "PERSONAL",
            minChunkSize: task.minChunkSize || 1,
            maxChunkSize: task.maxChunkSize || 2,
            alwaysPrivate: task.alwaysPrivate || true,
            timeSchemeId: task.timeSchemeId || "14c1749f-d0e0-4ab4-9c97-ca02e7fa212c",
            snoozeUntil: task.snoozeUntil || null,
            onDeck: task.onDeck || false,
            timeChunksRequired: convertTimeToChunks(task.timeChunksRequired as string) || 0,
            notes: task.notes || `{"goal": "${goal.name}", "step": "${stepIndex}"}`,
            priority: task.priority || "P3",
            due: task.due || "",
          }
          return sanitizedTask;
        });
        return {
          ...step,
          tasks: sanitizedTasks,
        }
      })
    }
    return sanitizedGoal
  }

  const handleNewGoal = async (newGoal: GoalType) => {
    const sanitizedGoal = sanitizeGoal(newGoal);
    const updatedGoalWithTasks = await addAllTasksToCalendar(sanitizedGoal);
    const updatedGoals = {
      ...goals,
      [updatedGoalWithTasks.name]: updatedGoalWithTasks,
    }

    const res = await fetch("api/goals", {
      method: "POST",
      body: JSON.stringify(updatedGoals),
    });

    const response = await res.json();
    if (response) {
      setGoals(updatedGoals)
    }
    handleCloseGoalModal()
  };

  const handleOpenTaskModal = () => setModalState("task");

  const handleCloseTaskModal = () => setModalState(undefined);

  const handleAddTask = async (task: Task) => {
    const res = await fetch("api/tasks", {
      method: "POST",
      body: JSON.stringify({ task: task }),
    });

    const response = await res.json();
    setResponse(response.data?.message || 'success');
    setModalState('response');
  }

  const handleConfirm = () => {
    setModalState(undefined);
    // window.location.reload();
  }

  // a function addAllTasksToCalendar that takes a goal and adds all tasks to the calendar
  const addAllTasksToCalendar = async (goal: GoalType) => {
    setModalState('loading');
    setProgress(0);
    let updatedGoal = JSON.parse(JSON.stringify(goal)); // Deep copy to avoid mutation
    let totalTasks = 0;
    let processedTasks = 0;

    // Calculate total number of tasks for progress tracking
    goal.steps.forEach(step => totalTasks += step.tasks.length);

    // Process each step and task without flattening
    const stepPromises = goal.steps.map((step, stepIndex) => {
      const taskPromises = step.tasks.map(async (task, taskIndex) => {
        try {
          const res = await fetch("api/tasks", {
            method: "POST",
            body: JSON.stringify({ task: task }),
          });

          const response = await res.json();
          if (!response.data?.message) {
            // Directly update the task using taskIndex
            updatedGoal.steps[stepIndex].tasks[taskIndex] = response.data;
          } else {
            console.error('Failed to add task', task);
          }
        } catch (error) {
          console.error('Error adding task', task, error);
        } finally {
          // Update progress after each task
          processedTasks++;
          setProgress(Math.round((processedTasks / totalTasks) * 100));
        }
      });
      return Promise.all(taskPromises); // Wait for all tasks in this step to be processed
    });

    await Promise.all(stepPromises); // Wait for all steps to be processed

    setModalState('response');
    setResponse(`Successfully added ${processedTasks} tasks to calendar`);
    return updatedGoal; // Return the updated goal with tasks updated in place
  }

  const renderModal = () => {
    switch (modalState) {
      case "goal":
        return <GoalModal goal={currentGoal} open onClose={handleCloseGoalModal} onSubmit={handleNewGoal} />
      case "task":
        return <TaskModal open onClose={handleCloseTaskModal} onSubmit={handleAddTask} />
      case 'response':
        return <Modal title="Response" open onClose={handleConfirm} >{response}</Modal>
      case 'loading':
        return <Modal title="Loading..." open onClose={() => { }} ><ProgressBar progress={progress} />{progress}%</Modal>
      default:
        return null;
    }
  }

  const tileClassName = ({ date, view }: { date: Date, view: string }) => {
    let classNames = 'tileClass'; // Set the base class name

    if (view === 'month') {
      // if today is the date, append 'today' to classNames
      if (date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
        classNames += ' today';
      }
    }
    return classNames;
  }

  const onClickDay = (value: Date) => {

  }

  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      // if date is after today, return null
      if (date > new Date()) {
        return null;
      }
      const utcDateString = date.toISOString().split('T')[0];
      const score = dateScoreMap.get(utcDateString);
      return <Square value={score ? score.length.toString() : '0'} />;
    }
  }

  const calendarLabel = ({ date, view }: { date: Date, view: string }) => {
    return (
      <span>{date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
    )

  }

  const renderCalendar = () => {
    return (<Calendar
      value={today}
      tileClassName={tileClassName}
      onClickDay={onClickDay}
      tileContent={tileContent}
      minDetail="month"
      maxDetail="month"
      next2Label={null}
      prev2Label={null}
      nextLabel={'>'}
      prevLabel={'<'}
      navigationLabel={calendarLabel}
      maxDate={new Date()}
    />)
  }

  return (
    <>
      <Layout className="Fixed" horizontal>
        <Button label="Add Goal" onAction={handleOpenGoalModal} />
        <Button label="Add Task" onAction={handleOpenTaskModal} />
        <Button label="Use" onAction={handleUse} type="use" />
        <Button label="Earn" onAction={handleEarn} type="earn" />
      </Layout>
      <Layout>
        <div className="spacer"></div>
        {renderCalendar()}
        <Layout>
          {goalsMarkup}
        </Layout>
        {pointsMarkup}
        {renderModal()}
      </Layout>
    </>
  );
}
