const express = require("express");
const path = require("path"); //needed when setting up static/file paths
const dotenv = require("dotenv");

//load the environment variables from .env
dotenv.config();

const db = require("./modules/portfolios/db"); //load db.js

//set up the Express app
const app = express();
const port = process.env.PORT || "8888";

// Middleware to parse JSON and URL-encoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//GET: /api/projects
// Returns list of projects in the form of JSON
app.get("/api/projects", async (request, response) => {
  const projects = await db.getProjects();
  response.json(projects);
});

// GET: /api/skills
// Returns the list of skills the form of JSON
app.get("/api/skills", async (request, response) => {
  const skills = await db.getSkills();
  response.json(skills);
});

// POST: /api/projects
// Adds a project to the database
// RequestBody: { name: String, date: String, description: String }
app.post("/api/projects", async (request, response) => {
  const { name, date, description, link} = req.body;
  await db.addProject(name, date, description, link);
  response.json({ message: "Project added successfully" });
});

// POST: /api/skills
// Expects { name: String, level: String } in the request body
app.post("/api/skills", async (request, response) => {
  const { name, level } = req.body;
  await db.addSkill(name, level);
  response.json({ message: "Skill added successfully" });
});



//set up application template engine
app.set("views", path.join(__dirname, "views")); //the first "views" is the setting name
//the second value above is the path: __dirname/views
app.set("view engine", "pug");

//set up folder for static files
app.use(express.static(path.join(__dirname, "public")));

//USE PAGE ROUTES FROM ROUTER(S)
app.get("/", async (request, response) => {
  let projectList = await db.getProjects();
  let skillList = await db.getSkills();

  //if there's nothing in the pets collection, initialize with some content then get the pets again
  if (!projectList.length) {
    await db.initializeProjects(); 
    projectList = await db.getProjects();
  }
  response.render("index", { projects: projectList, skills: skillList });
});

//Render Add Project Pages
app.get("/addProject", (request, response) => {
  response.render("common/addProject");
});

app.get("/addSkill", (request, response) => {
  response.render("common/addSkill");
});

// POST: /addProject
// Adds a new project from the form submission
app.post("/addProject", async (request, response) => {
  const { name, date, description, link } = request.body;
  await db.addProject(name, date, description, link);
  response.redirect("/");
});

// POST: /addSkill
// Adds a new skill from the form submission
app.post("/addSkill", async (request, response) => {
  const { name, level } = request.body;
  await db.addSkill(name, level);
  response.redirect("/");
});

//Update project routes
app.get("/updateProject", async (request, response) => {
  //update something
  await db.updatedProjectName("Project 1", "New");
  response.redirect("/");
});

app.get("/delete", async (request, response) => {
  await db.deleteProjectByName("Project 3");
  response.redirect("/");
})

//set up server listening
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
}); 

