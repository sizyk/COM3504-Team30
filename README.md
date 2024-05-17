# COM3504-Team30

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed on your machine. You can download it [here](https://nodejs.org/).
- MongoDB installed and running. You can download it [here](https://www.mongodb.com/try/download/community).

## Installation

To install this project, follow these steps:

1. Download the repository:
2. Navigate into the project directory:
```bash
cd project
```

3. Install dependencies:
```bash
npm install
```

## Usage
To run the project, use the following command:
```bash
npm start
```
This will start the server, and you should see a message indicating the server is running on a specific port (usually port 3000 by default).
Visit localhost:3000 to see the app.

## List of Pages
### View all plant sightings page
- View, Add, Sort, and Filter plant sightings
- Map view of the sightings
### Individual plant page
- View full details of a plant sighting
- Edit a plant sighting (Only if Identification is in progress)
- Chat to discuss identification (Only if Identification is in progress)
- Add Identification (Only for the sighting creator)

## List of features
### Logging in / out
- When a user first opens the project, they are presented with a modal to log in with
{image of login modal here}
- Once logged in, a user can access the rest of the features of the website, detailed below
- A user can log out by clicking the ``Logout’’ button
### Adding a plant
- For the sighting's location, you can use your current geolocation or pick a location from a map
- Adding an image for a sighting can be done by selecting an image from your files, taking a picture from your camera (mobile only) or providing a link to an image file.
### Editing a plant
- Users can edit all attributes of a plant sighting while identification is in progress
### Identifying a plant
- Once the correct scientific name of a plant sighting is added, information from DBPedia is used to update the plant's details. 
### Chatting
- Users can use the chat feature to communicate with the sightings creator to help identify the plant
- The plant's creator receives chat notifications
### View Plant(s)
- Show all plants and individual page
- Show plants on a map using Leaflet and OpenStreetMap
- Users can filter plants by their identification status, their properties, and their exposure to sun
- Users can sort the plants by the date they were added and the distances from the user.
### Responsiveness
Great care was taken to ensure that the app works well (and looks good) at any screen size. For example, through careful use of CSS breakpoints, the UIs for mobile and desktop look drastically different - with the desktop site looking like a native desktop application, and the mobile site looking like a native mobile application. Furthermore, in order to better user experience even more, a dark/light theme toggle was added, enabling users to choose the style that they are most comfortable with.

Screenshots of the main pages on both mobile and desktop (and with both colour schemes) can be found below.

| <img src="readme-img/home-laptop-light.png" height=450> | <img src="readme-img/home-mobile-light.png" height=450> |
|---------------------------------------------------------|---------------------------------------------------------|

| <img src="readme-img/home-laptop-dark.png" height=450> | <img src="readme-img/home-mobile-dark.png" height=450> |
|--------------------------------------------------------|--------------------------------------------------------|

| <img src="readme-img/map-laptop-light.png" height=450> | <img src="readme-img/map-mobile-light.png" height=450> |
|--------------------------------------------------------|--------------------------------------------------------|

| <img src="readme-img/map-laptop-dark.png" height=450> | <img src="readme-img/map-mobile-dark.png" height=450> |
|-------------------------------------------------------|-------------------------------------------------------|

| <img src="readme-img/plant-laptop-light.png" height=450> | <img src="readme-img/plant-mobile-light.png" height=450> |
|----------------------------------------------------------|----------------------------------------------------------|

| <img src="readme-img/plant-laptop-dark.png" height=450> | <img src="readme-img/plant-mobile-dark.png" height=450> |
|---------------------------------------------------------|---------------------------------------------------------|

### Progressive Web App
- The app can be downloaded as a PWA app and used offline, with changes made offline syncing when a user goes online and vice versa.


## Team Dynamics
| Name      	         | Role      	                  |
|---------------------|------------------------------|
| Andreas Evripidou 	 | Team Leader & Full-Stack Dev |
| Jack Sanders	       | UI Leader & Full-Stack Dev   |
| James March		       | Full-Stack Dev  	            |
| Stylianos Kyzis 	   | Full-Stack Dev 	             |

## Git Statistics

ToDo: Add Statistics screenshots once everything is merged

- jacksanders02 = Jack Sanders (jsanders4@sheffield.ac.uk)
- Fokkos = James March (jmarch2@sheffield.ac.uk)
- Andreas-Evripidou = Andreas Evripidou (eandreas1@sheffield.ac.uk)
- unzisizyk = Stylianos Kyzis (skyzis1@sheffield.ac.uk)

## Screenshots
