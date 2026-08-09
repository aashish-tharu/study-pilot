const DEPTH_CONFIG = {
  quick: { baseHours: 1, hoursPerSubtopic: 0.25, weightMultiplier: 1 },
  moderate: { baseHours: 1.75, hoursPerSubtopic: 0.4, weightMultiplier: 1.5 },
  deep: { baseHours: 2.5, hoursPerSubtopic: 0.6, weightMultiplier: 2 },
};

// here i'm estimatinng how many study hours a single topic needs
// based on the weightage and its subtopic
function estimateTopicHours(topic, depthLevel) {
  const { baseHours, hoursPerSubtopic, weightMultiplier } = DEPTH_CONFIG[depthLevel];
  const subtopicCount = topic.subtopics?.length || 0;

  const hours =
    baseHours +
    subtopicCount * hoursPerSubtopic +
    (topic.weightagePercent / 100) * weightMultiplier;

  return Math.round(hours * 10) / 10; // round to 1 decimal
}


export function generateSchedule(topics, startDate, daysToComplete, depthLevel) {
  if (!topics.length) {
    throw new Error("Cannot generate a schedule with zero topics");
  }
  if (!DEPTH_CONFIG[depthLevel]) {
    throw new Error(`Invalid depthLevel: ${depthLevel}`);
  }
  if (daysToComplete < 1) {
    throw new Error("daysToComplete must be at least 1");
  }

  const topicsWithHours = topics.map((t) => {
    const topic = typeof t.toObject === "function" ? t.toObject() : t;
    return {
      ...topic,
      estimatedHours: estimateTopicHours(topic, depthLevel),
    };
  });

  const totalHours = topicsWithHours.reduce((sum, t) => sum + t.estimatedHours, 0);
  const targetHoursPerDay = totalHours / daysToComplete;

  const rawDays = [];
  let currentDay = [];
  let currentDayHours = 0;

  for (const topic of topicsWithHours) {
    const wouldOverflow = currentDayHours + topic.estimatedHours > targetHoursPerDay;

    if (wouldOverflow && currentDay.length > 0) {
      rawDays.push({ tasks: currentDay, totalHours: currentDayHours });
      currentDay = [];
      currentDayHours = 0;
    }

    currentDay.push(topic);
    currentDayHours += topic.estimatedHours;
  }

  if (currentDay.length > 0) {
    rawDays.push({ tasks: currentDay, totalHours: currentDayHours });
  }

  const scheduleDays = rawDays.map((day, index) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + index);

    return {
      date,
      tasks: day.tasks.map((t) => ({
        topicId: t._id,
        name: t.name,
        estimatedHours: t.estimatedHours,
      })),
      totalHours: Math.round(day.totalHours * 10) / 10,
    };
  });

  let warning = null;
  if (scheduleDays.length > daysToComplete) {
    warning = `This syllabus realistically needs ${scheduleDays.length} days at "${depthLevel}" depth, more than the ${daysToComplete} you requested. Consider fewer days of "quick" depth, or accept the longer plan.`;
  }

  return { scheduleDays, warning };
}