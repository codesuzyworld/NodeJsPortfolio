const mongoose = require("mongoose");

//const dbUrl = `mongodb://${process.env.DBUSER}:${process.env.DBPWD}@${process.env.DBHOST}/?authSource=testdb`;
const dbUrl = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPWD}@${process.env.DBHOST}/${process.env.DBNAME}?retryWrites=true&w=majority`;
//set up Project and skills schema and model
const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    date: String,
    description: String,
    link: String,
    stack: [String], 
    image: {
      data: String,
      contentType: String
    }
  },
  { collection: "projects"}
);

const SkillSchema = new mongoose.Schema(
  {
    name: String,
    tagColor: String,
    subskills: [String]
  },
  { collection: "skills" }
);


//above, you could pass the collection name in an options object to specify a specific collection to associate with the Pet model
const Project = mongoose.model("Project", ProjectSchema);
const Skill = mongoose.model("Skill", SkillSchema);

//MONGODB FUNCTIONS
async function connect() {
  await mongoose.connect(dbUrl); //connect to mongodb
}

//Function to add some initial pets to the DB.
async function initializeProjects() {
  const projectList = [
    {
      name: "Project 1",
      date: "10/19/2024",
      description: "Cool Project it is!",
      link: "https://github.com/example/project1",
      stack: ["JavaScript", "React", "Node.js"],  // Changed from skills to stack
      image: {
        data: null,
        contentType: null
      }
    },
    {
      name: "Project 2",
      date: "10/10/2024",
      description: "Cool Project woohoo!",
      link: "https://github.com/example/project2",
      stack: ["Python", "Django", "PostgreSQL"],  // Changed from skills to stack
      image: {
        data: null,
        contentType: null
      }
    }
  ];
  await Project.insertMany(projectList);
}


//Add a single Project.
async function addProject(pName, pDate, pDesc, pLink, stack, imageData, contentType) {
  let newProject = new Project({
    name: pName,
    date: pDate,
    description: pDesc,
    link: pLink,
    stack: stack,  // Make sure we're using the stack parameter
    image: {
      data: imageData,
      contentType: contentType
    }
  });
  await newProject.save();
}

// Add a single skill
async function addSkill(skillName, tagColor, subskills) {
  let newSkill = new Skill({
    name: skillName,
    tagColor: tagColor,
    subskills: subskills
  });
  await newSkill.save();
}

// Function to get all skills
async function getSkills() {
  await connect();
  return await Skill.find({});
}

//Get all Project from the Projects collection
async function getProjects() {
  await connect();
  //for sort(), you can use "asc", "desc" (or 1, -1)
  return await Project.find({}); //return array for find all
}

//Function to update a Project name
async function updateProjectName(oldName, newName) {
  await connect();
  await newProject.updateOne(
    { name: oldName },
    { name: newName }
  );
}

//Function to delete a Project by name
async function deleteProjectByName(projectName) {
  await connect();
  await Project.deleteMany({ name: projectName });
}

module.exports = {
  initializeProjects,
  addProject,
  getProjects,
  addSkill,
  getSkills,
  updateProjectName,
  deleteProjectByName
}