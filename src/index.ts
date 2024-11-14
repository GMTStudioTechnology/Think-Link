import { ThinkLinkNLP } from './components/ThinkLink_model';

const nlp = new ThinkLinkNLP();

const inputCommands = [
  "Create an urgent meeting with the marketing team tomorrow",
  "Add a low priority note about grocery shopping",
  "Schedule a doctor's appointment next week",
  "Finish the finance report by Friday",
  "Organize a family dinner for Sunday",
  "Create a new project plan for the upcoming launch",
  "Add a note to buy gym equipment",
  "Set a reminder for the team meeting next Monday",
  "Update the work calendar with upcoming deadlines",
  "Delete the old notes from last month's review"
];

inputCommands.forEach(command => {
  const result = nlp.processCommand(command);
  console.log(result.message);
  if (result.suggestions) {
    console.log('Suggestions:', result.suggestions.join('; '));
  }
}); 