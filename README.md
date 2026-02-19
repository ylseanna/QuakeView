# QuakeView

QuakeView is an interactive visualisation program for earthquake catalogues, developed at the University of Iceland for use in Iceland. It aims to allow for rapid importing and analysis of user-made catalogs.

QuakeView is an open-source program written in react/next.js, with a python back-end and runs in an electron wrapper.

## Features

- Importing of arbitrary `.csv` catalogs, with in-program import and filtering controls
- 2D and 3D maps of the imported events (tested up to 60.000 events)
- Dynamic formatting of events, e.g. scaling, opacity, color(maps)
- GPU acceleration of 3D maps and plots

## To build from source

Create a python environment for running the flask backend, by installing all the requirements in requirement.txt.

Then run "npm i".

Activate the python environment.

Run "npm run dev" for the development environment.

Then the commands "npm run build" and "npm run electron:dist:deb" can be used to create the distributable (currently only working for linux).
