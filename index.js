const express = require("express");
const path = require("path"); //needed when setting up static/file paths
const dotenv = require("dotenv");
const multer = require('multer');
const upload = multer();

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
  try {
    const { name, date, description, link, stack } = request.body;
    const imageData = request.body.image?.data || null;
    const contentType = request.body.image?.contentType || null;
    
    // Convert stack string to array
    const stackArray = stack ? stack.split(',').map(tech => tech.trim()) : [];
    
    await db.addProject(name, date, description, link, stackArray, imageData, contentType);
    response.json({ message: "Project added successfully" });
  } catch (error) {
    console.error('Error adding project:', error);
    response.status(500).json({ error: 'Failed to add project' });
  }
});
// POST: /api/skills
// Expects { name: String, level: String } in the request body
app.post("/api/skills", async (request, response) => {
  try {
    const { name, tagColor, subskills } = request.body;
    const subskillsArray = subskills ? subskills.split(',').map(skill => skill.trim()) : [];
    
    await db.addSkill(name, tagColor, subskillsArray);
    response.json({ message: "Skill added successfully" });
  } catch (error) {
    console.error('Error adding skill:', error);
    response.status(500).json({ error: 'Failed to add skill' });
  }
});



//set up application template engine
app.set("views", path.join(__dirname, "views")); //the first "views" is the setting name
//the second value above is the path: __dirname/views
app.set("view engine", "pug");

//set up folder for static files
app.use(express.static(path.join(__dirname, "public")));

//USE PAGE ROUTES FROM ROUTER(S)
app.get("/", async (request, response) => {
  try {
    let projectList = await db.getProjects();
    let skillList = await db.getSkills();

    if (!projectList.length) {
      await db.initializeProjects(); 
      projectList = await db.getProjects();
    }
    response.render("index", { projects: projectList, skills: skillList });
  } catch (error) {
    console.error('Error loading page:', error);
    response.status(500).send('Error loading page');
  }
});


//Render Add Project Pages
app.get("/addProject", (request, response) => {
  response.render("common/addProject");
});

app.post("/addProject", upload.single('image'), async (request, response) => {
  try {
    const { name, date, description, link, stack } = request.body;
    let imageData = null;
    let contentType = null;
    
    if (request.file) {
      imageData = request.file.buffer.toString('base64');
      contentType = request.file.mimetype;
    }
    
    // Convert stack string to array
    const stackArray = stack ? stack.split(',').map(tech => tech.trim()) : [];
    
    await db.addProject(name, date, description, link, stackArray, imageData, contentType);
    response.redirect("/");
  } catch (error) {
    console.error('Error adding project:', error);
    response.status(500).send('Error adding project');
  }
});

app.get("/addSkill", (request, response) => {
  response.render("common/addSkill");
});

// POST: /addSkill
// Adds a new skill from the form submission
app.post("/addSkill", async (request, response) => {
  const { name, tagColor, subskills } = request.body;
  const subskillsArray = subskills.split(',').map(skill => skill.trim());
  await db.addSkill(name, tagColor, subskillsArray);
  response.redirect("/");
});

//Update project routes
app.get("/updateProject", async (request, response) => {
  try {
    await db.updateProjectName("Project 1", "New");
    response.redirect("/");
  } catch (error) {
    console.error('Error updating project:', error);
    response.status(500).send('Error updating project');
  }
});

app.get("/delete", async (request, response) => {
  try {
    await db.deleteProjectByName("Project 3");
    response.redirect("/");
  } catch (error) {
    console.error('Error deleting project:', error);
    response.status(500).send('Error deleting project');
  }
});
//set up server listening
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
}); 

