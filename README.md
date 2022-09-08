# Expenses Administrator

This project can help you to have a better control of your income and expenses, the project was build to save data in the browser memory, in order to reduce the number of requests to firestore, so, does not make petitions in every switch of route.

## Features
- Add/remove/edit categories for both income and expenses
- Add/remove/edit payment methods for your expenses
- You can add/remove/edit periods where you can add both incomes and expenses between a range of dates
- Into periods, you can add/remove/edit income and expenses, you can filter and sort for some criteria in the income and expenses table
- You can add/remove/edit groups of expenses in order to add them faster to a period
- You have some charts into each period, so you can view a general overview of you balance

## Technologies
- The application was build with ReactJS, TypeScript and AntDesign as design system
- Uses Firestore database
- Uses Firebase authentication
- Uses Redux Toolkit for state management and React Router for routing
- Was built with create-react-app
- Uses ESLint

***Note:*** *This project has disabled Signup, so it requires to add a user manually*

## How to run it

### Prerequisites
1. You need to sign in [here](https://firebase.google.com/) with your Google Account 
2. You'll need to create a new project, new App, and add a firestore database in ***test mode***, you can follow the two first step of [this](https://firebase.google.com/docs/web/setup) Get started guide
4. You'll need to add the authentication module and add ***Email/Password*** provider
   - Add a user, set email and password

### Instructions
1. Checkout the repository
2. From your firebase project settings/ App get the required data from SDK configuration and add it into ***.env*** file, for the next vars:
   - REACT_APP_API_KEY
   - REACT_APP_AUTH_DOMAIN
   - REACT_APP_PROJECT_ID
   - REACT_APP_MESSAGING_SENDER_ID
   - REACT_APP_APP_ID
3. Install dependencies with ***yarn*** or ***npm i***
4. Run start script with ***yarn start*** or ***npm run start***, the application should launch your browser on https://localhost:3000, otherwise, you can go manually
5. Enter email and password of the user created on the 4th prerequisites step
6. Enjoy it!
