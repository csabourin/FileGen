document.addEventListener('DOMContentLoaded', initialize);


function updateLineStyles(styledContenteditable) {
  const lines = styledContenteditable.innerHTML.split('\n').map(line => line.trim()).join('<br>');
  const content = lines.split('<br>').map(line => `<div class="line">${line || ''}</div>`).join('');
  styledContenteditable.innerHTML = content;
}


function initialize() {
  const courseTemplateElement = document.querySelector('#CourseTemplateDiv > code');
  const savedTemplate = localStorage.getItem('courseTemplate');
  const styledContenteditable = document.getElementById('CourseTitles');


  if (savedTemplate) {
    courseTemplateElement.innerHTML = savedTemplate;
    Prism.highlightElement(courseTemplateElement);
    document.getElementById('resetTemplateButton').style.display = 'block';
  }

  addEventListeners(courseTemplateElement, styledContenteditable);
}

function addEventListeners(courseTemplateElement, styledContenteditable) {
  const parentElement = courseTemplateElement.parentNode;
  styledContenteditable.addEventListener('input', updateLineStyles(styledContenteditable));

  parentElement.addEventListener('input', saveTemplate);

  parentElement.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      insertNewlineAtCaret();
      saveTemplate();
    } else if (event.key === 'Tab') {
      moveToNextTabbableElement();
    }
  });
}

function moveToNextTabbableElement() {
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const elements = Array.prototype.slice.call(document.querySelectorAll(focusableElements));
  const index = elements.indexOf(document.activeElement);
  if (index > -1) {
    const nextElement = elements[index + 1] || elements[0];
    nextElement.focus();
  }
}

function generateHTMLFiles() {
  const courseCode = getTrimmedValue('CourseCode');
  const courseName = getTrimmedValue('CourseName');
  const courseTitles = getTrimmedText('CourseTitles').split('\n').map(title => title.trim());
  const template = document.getElementById('CourseTemplateDiv').innerText;

  if (courseTitles.length === 0 || courseTitles[0] === "") {
    displayError(true);
    return;
  } else {
    displayError(false);
  }

  const updatedTemplate = replacePlaceholders(template, courseCode);
  const zip = new JSZip();

  courseTitles.forEach(title => {
    const fileName = convertToSnakeCase(title) + '.html';
    const moduleNumber = extractModuleNumber(title);
    const fileContent = generateFileContent(updatedTemplate, title, moduleNumber, courseName);

    zip.file(fileName, fileContent);
  });

  zip.folder("assets")
    .folder("css")
    .file(courseCode + "-style.css", "/* CSS content here */");

  zip.folder("assets")
    .folder("js")
    .file(courseCode + "-script.js", "// JavaScript content here");

  zip.generateAsync({ type: 'blob' }).then(content => {
    downloadZipFile(content, courseCode);
  });
}

function getTrimmedValue(elementId) {
  const element = document.getElementById(elementId);
  return element.value.trim();
}

function getTrimmedText(elementId) {
  const element = document.getElementById(elementId);
  return element.innerText.trim();
}

function displayError(show) {
  const errorMessage = document.getElementById('courseTitlesError');
  errorMessage.style.display = show ? 'block' : 'none';
}

function replacePlaceholders(template, courseCode) {
  return template.replace(/{{CourseCode}}/g, courseCode);
}

function extractModuleNumber(title) {
  const moduleMatch = title.match(/^(\d+)(?:\.\d+)?/);
  return moduleMatch ? moduleMatch[1] : '';
}

function generateFileContent(template, title, moduleNumber, courseName) {
  let fileContent = template.replace(/{{Header}}/g, title);
  const modulePart = moduleNumber ? `${title.trim()} | Module ${moduleNumber}` : title;

  return fileContent.replace('{{Template}}', `${modulePart} | ${courseName}`);
}

function downloadZipFile(content, courseCode) {
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${courseCode}_course_files.zip`;
  link.click();
  URL.revokeObjectURL(url);
}

function convertToSnakeCase(str) {
  return str.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50);
}

function saveTemplate() {
  const courseTemplateElement = document.querySelector('#CourseTemplateDiv > code');
  const caretPosition = saveCaretPosition(courseTemplateElement);

  localStorage.setItem('courseTemplate', courseTemplateElement.innerHTML);
  Prism.highlightElement(courseTemplateElement);
  restoreCaretPosition(courseTemplateElement, caretPosition);

  document.getElementById('resetTemplateButton').style.display = 'block';
}

function insertNewlineAtCaret() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const newlineNode = document.createTextNode('\n');

  range.deleteContents();
  range.insertNode(newlineNode);
  range.setStartAfter(newlineNode);
  range.setEndAfter(newlineNode);

  selection.removeAllRanges();
  selection.addRange(range);
}

function saveCaretPosition(context) {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const preSelectionRange = range.cloneRange();

  preSelectionRange.selectNodeContents(context);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);

  const start = preSelectionRange.toString().length;

  return { start: start, end: start + range.toString().length };
}

function restoreCaretPosition(context, savedPosition) {
  if (!savedPosition) return;

  const charIndex = { count: 0 };
  const range = document.createRange();

  range.setStart(context, 0);
  range.collapse(true);

  const nodeStack = [context];
  let node;
  let foundStart = false;
  let stop = false;

  while (!stop && (node = nodeStack.pop())) {
    if (node.nodeType === 3) {
      const nextCharIndex = charIndex.count + node.length;
      if (!foundStart && savedPosition.start >= charIndex.count && savedPosition.start <= nextCharIndex) {
        range.setStart(node, savedPosition.start - charIndex.count);
        foundStart = true;
      }
      if (foundStart && savedPosition.end >= charIndex.count && savedPosition.end <= nextCharIndex) {
        range.setEnd(node, savedPosition.end - charIndex.count);
        stop = true;
      }
      charIndex.count = nextCharIndex;
    } else {
      let i = node.childNodes.length;
      while (i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function resetTemplate() {
  const defaultTemplate = `&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;!-- Required meta tags --&gt;
  &lt;meta charset="utf-8"&gt;
  &lt;meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"&gt;
  &lt;!-- Bootstrap CSS --&gt;
  &lt;link rel="stylesheet" href="/shared/LCS_HTML_Templates/CSPS_Template_2021/_assets/thirdpartylib/bootstrap-4.3.1/css/bootstrap.min.css"&gt;
  &lt;!-- Font Awesome CSS --&gt;
  &lt;link rel="stylesheet" href="/shared/LCS_HTML_Templates/CSPS_Template_2021/_assets/thirdpartylib/fontawesome-free-5.9.0-web/css/all.min.css"&gt;
  &lt;!-- Template CSS --&gt;
  &lt;link rel="stylesheet" href="/shared/LCS_HTML_Templates/CSPS_Template_2021/_assets/css/styles.min.css"&gt;
  &lt;link rel="stylesheet" href="/shared/LCS_HTML_Templates/CSPS_Template_2021/_assets/css/custom.css"&gt;
  &lt;link rel="stylesheet" href="assets/css/{{CourseCode}}-style.css"&gt;
  &lt;title&gt;{{Template}}&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;div class="container-fluid data"&gt;
    &lt;div class="row"&gt;
      &lt;div class="col-12 offset-md-1 col-md-10 offset-lg-2 col-lg-8"&gt;
        &lt;h1&gt;{{Header}}&lt;/h1&gt;
        &lt;p&gt;Insert your content here.&lt;/p&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
  &lt;!-- Scripts --&gt;
  &lt;script src="/shared/LCS_HTML_Templates/CSPS_Template_2021/_assets/thirdpartylib/jquery/jquery-3.4.1.min.js"&gt;&lt;/script&gt;
  &lt;script src="/shared/LCS_HTML_Templates/CSPS_Template_2021/_assets/thirdpartylib/popper-js/popper.min.js"&gt;&lt;/script&gt;
  &lt;script src="/shared/LCS_HTML_Templates/CSPS_Template_2021/_assets/thirdpartylib/bootstrap-4.3.1/js/bootstrap.min.js"&gt;&lt;/script&gt;
  &lt;script src="/shared/LCS_HTML_Templates/CSPS_Template_2021/_assets/js/scripts.min.js"&gt;&lt;/script&gt;
  &lt;script type="module" src="assets/js/{{CourseCode}}-script.js"&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;`;

  const courseTemplateElement = document.querySelector('#CourseTemplateDiv > code');
  const caretPosition = saveCaretPosition(courseTemplateElement);

  courseTemplateElement.innerHTML = defaultTemplate;
  Prism.highlightElement(courseTemplateElement);
  localStorage.removeItem('courseTemplate');

  restoreCaretPosition(courseTemplateElement, caretPosition);
  document.getElementById('resetTemplateButton').style.display = 'none';
}
