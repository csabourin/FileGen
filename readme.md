# Brightspace Course Files Generator

## Overview

The Brightspace Course Files Generator is a web tool that allows users to generate course files for Brightspace LMS. By providing a course template and inputting course details, users can dynamically create HTML files and package them into a downloadable zip file, complete with CSS and JS assets.

## Features

- **Dynamic Template Replacement**: Replace placeholders in a provided HTML template with user inputs such as course code, course name, and page titles.
- **File Organization**: Automatically creates a folder structure for assets (CSS and JS) and includes them in the generated zip file.
- **User Interaction**: Provides an interactive interface for users to input course details and customize the template.

## Setup and Usage

### Usage

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/brightspace-course-files-generator.git
   cd brightspace-course-files-generator
   ```

2. **Open `index.html` in a Web Browser**:
   Open the `index.html` file in your web browser to access the tool.

3. **Input Course Details**:
   - Enter the course code in the "Course Code" field.
   - Enter the course name in the "Course Name" field.
   - Enter the list of page titles in the "Page Titles" field, one per line.

4. **Customize the Template**:
   - Modify the HTML template in the "File Template" section if necessary.
   - Use placeholders `{{Template}}`, `{{CourseCode}}`, and `{{Header}}` within the template.

5. **Generate and Download Files**:
   - Click the "Generate Files" button to create the HTML files and package them into a zip file.
   - The generated zip file will include the HTML files, CSS, and JS assets.

6. **Reset Template**:
   - Click the "Reset to Default" button to revert to the default template.

## Files in the Repository

- `index.html`: The main HTML file containing the structure of the web tool.
- `script.js`: The JavaScript file with the logic for generating files and handling user input.
- `style.css`: The CSS file for styling the web tool.
- `prism.css`: The CSS file for syntax highlighting provided by Prism.js.
- `prism.js`: The JavaScript file for syntax highlighting provided by Prism.js.

## Acknowledgements

- [JSZip](https://stuk.github.io/jszip/) for creating zip files.
- [Prism.js](https://prismjs.com/) for syntax highlighting.