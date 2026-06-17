const projects = [
    {
        img: "Immagini/pidgy/Fiverr_Review_2.jpg",
        alt: "Project 16",
        title: "Pidgy's Custom Server",
        description: "Un mostro ha mangiato tutte le paste di cappelletti...",
        skills: [
            "Multiplayer Integration",
            "Environmental Interaction Design",
            "Quality Assurance (QA) Testing",
            "Game Mechanics Design",
            "Performance Optimization",
            "User Interface (UI) and Experience (UX) Design"
        ]
    },
    {
        img: "Immagini/Chess/ChessConcept.jpeg",
        alt: "Project 15",
        title: "lapierre1 Custom Server",
        description: "coming soon",
        skills: ["coming soon", "coming soon", "coming soon", "coming soon", "coming soon", "coming soon"]
    },
    {
        img: "Immagini/SborroCraft.jpg",
        alt: "Project 3",
        title: "SborroCraft",
        description: "SborroCraft è un progetto nato come un piccolo server Minecraft tra amici...",
        skills: [
            "Technical Knowledge",
            "Troubleshooting",
            "Data Management",
            "Community Management",
            "Server Performance Optimization",
            "Cross-Platform Integration"
        ]
    }
];

let currentProjectIndex = 0;

function updateSlideshow(slideshow, project) {
    const img = slideshow.querySelector('img');
    const title = slideshow.querySelector('h2');
    const description = slideshow.querySelector('p');
    const skills = slideshow.querySelector('ul');

    img.src = project.img;
    img.alt = project.alt;
    title.textContent = project.title;
    description.textContent = project.description;

    // Clear existing skills
    while (skills.firstChild) {
        skills.removeChild(skills.firstChild);
    }

    // Add new skills
    project.skills.forEach(skill => {
        const li = document.createElement('li');
        li.textContent = skill;
        skills.appendChild(li);
    });
}

function cycleProjects() {
    const slideshows = document.querySelectorAll('.slideshow');
    slideshows.forEach(slideshow => {
        slideshow.classList.remove('fade-in');
        // Update the slideshow with the next project
        updateSlideshow(slideshow, projects[currentProjectIndex]);

        // Trigger reflow to restart the animation
        void slideshow.offsetWidth;
        slideshow.classList.add('fade-in');
    });

    // Move to the next project, loop back to the start if needed
    currentProjectIndex = (currentProjectIndex + 1) % projects.length;
}

// Cycle projects every 5 seconds
setInterval(cycleProjects, 5000);
