# **App Name**: Student Insights Hub

## Core Features:

- Secure User Authentication: Secure login and authentication using Firebase Authentication, ensuring only authorized personnel can access the student data.
- Data Import and Storage: Upload student data from Excel or CSV files and store it securely in Firebase Firestore. Storing file uploads to Cloudinary.
- Real-time Analytics Dashboard: Display interactive charts and summary reports, rendered using Jinja2 templates, to give educators clear insights into student performance and trends. These summaries must include computed mean, mode, median, max and min for any selected data range or filter.

## Style Guidelines:

- Primary color: Deep Blue (#3F51B5) to convey trust and stability, reflecting the importance of educational data.
- Background color: Light Grey (#ECEFF1) to ensure readability and reduce eye strain during prolonged use.
- Accent color: Bright Green (#4CAF50) to highlight key metrics and actions, drawing attention to areas needing focus.
- Body and headline font: 'Inter', a sans-serif font, which provides a modern, neutral and objective look.
- Use consistent, clear icons from a library like Material Icons to represent data types, actions, and navigation elements.
- Maintain a clean, intuitive layout with consistent spacing and alignment to aid quick understanding of data relationships and UI functions.
- Use subtle transitions and animations to provide feedback on user interactions, like loading indicators or data updates, without being distracting.