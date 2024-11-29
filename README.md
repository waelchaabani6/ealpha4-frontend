# Ealpha 

## Configuration
- Node Version: >=16.19.1

## Installation
Ealpha frontend requires [Node.js](https://nodejs.org/) v16+ to run.
Install the dependencies and devDependencies and start the server.

## Env Variables
```
VITE_APP_USER_SERVICE_URL=
VITE_APP_NOTIFICATION_SERVICE_URL=
VITE_APP_COURSE_CODE_SERVICE_URL=
VITE_APP_SCHOOL_SERVICE_URL=
VITE_APP_ASSESSMENT_SERVICE_URL=
VITE_APP_ASSIGNMENT_SERVICE_URL=
VITE_APP_MASTER_SERVICE_URL=
VITE_APP_REPORTS_SERVICE_URL=
VITE_APP_ROSTER_SERVICE_URL=
VITE_APP_CMS_SERVICE_URL=
VITE_APP_DIGITAL_LIBRARY_SERVICE_URL=
VITE_APP_VITE_SECRET_KEY=

VITE_APP_OBEASSESS_SDK_URL=
VITE_OBESASS_API_KEY=

VITE_APP_SDK=
VITE_APP_IFRAME_APP_SDK=

VITE_APP_GOOGLE_CLASSROOM_KEY=
VITE_APP_GOOGLE_CLASSROOM_CLIENT_ID=
```

# Local Environment
```sh
cd ealpha4-perfect-purity-frontend
npm i
npm run dev
```

# UAT Environment
    npm run build:uat
    
# Pre-prod Environment
    npm run build:preprod