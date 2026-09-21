export interface SeedLesson {
  orderNum: number;
  title: string;
  summary: string;
  contentMarkdown: string;
  codeExampleHtml?: string;
  codeExampleCss?: string;
  codeExampleJs?: string;
  codeExamplePhp?: string;
  codeExampleSql?: string;
  keyTakeaways: string[];
  sandboxBridgeChallengeId?: number;
}

export interface SeedCourse {
  trackId: string;
  title: string;
  level: string;
  description: string;
  iconName: string;
  estimatedHours: number;
  prerequisiteCourseId: number | null;
  lessons: SeedLesson[];
}

export const coursesToSeed: SeedCourse[] = [
  // 1. HTML5 TRACK
  {
    trackId: 'html',
    title: 'HTML5 Mastery & Document Architecture',
    level: 'Beginner',
    description: 'Master semantic web layout structures, accessibility ARIA standards, modern input validation, tables, and SEO document heads.',
    iconName: 'Code',
    estimatedHours: 5,
    prerequisiteCourseId: null,
    lessons: [
      {
        orderNum: 1,
        title: 'HTML Basics & Document Structure',
        summary: 'Understand doctype declarations, HTML tags, attributes, and the fundamental document body layout.',
        contentMarkdown: `### The Structure of an HTML5 Document\nHTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser.\n\nEvery HTML5 document starts with a \`<!DOCTYPE html>\` declaration followed by nested elements:\n- \`<html>\`: Root element wrapping all page content.\n- \`<head>\`: Contains metadata, title, character encoding, and stylesheet links.\n- \`<body>\`: Holds all visible elements like headings, paragraphs, images, and buttons.`,
        codeExampleHtml: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My First Web Page</title>\n</head>\n<body>\n  <h1>Welcome to WebDev Academy</h1>\n  <p>HTML forms the structural skeleton of every website.</p>\n</body>\n</html>`,
        keyTakeaways: ['Always specify <!DOCTYPE html> at line 1 for standard rendering mode', 'Include <meta charset="UTF-8"> for international text encoding', 'Place all visible content strictly inside the <body> tag'],
        sandboxBridgeChallengeId: 1
      },
      {
        orderNum: 2,
        title: 'Semantic HTML5 Elements & Layout Structure',
        summary: 'Learn how to structure web pages using modern HTML5 tags instead of generic div wrappers.',
        contentMarkdown: `### Why Semantic HTML Matters\nSemantic HTML tags give meaning to webpage structure for both browsers and accessibility screen readers.\n\nKey semantic elements include:\n- \`<header>\`: Container for site branding, logo, and top navigation.\n- \`<nav>\`: Block for primary menu navigation links.\n- \`<main>\`: The central unique content of the page.\n- \`<article>\`: Self-contained article or blog item.\n- \`<aside>\`: Contextual sidebar or callout content.\n- \`<footer>\`: Document footer containing copyright, terms, and social links.`,
        codeExampleHtml: `<header>\n  <h1>WebDev Academy</h1>\n  <nav>\n    <a href="#courses">Courses</a>\n    <a href="#sandbox">Sandbox</a>\n  </nav>\n</header>\n<main>\n  <article>\n    <h2>Semantic HTML Guide</h2>\n    <p>Semantic markup improves SEO rankings and screen reader accessibility.</p>\n  </article>\n</main>\n<footer>\n  <p>&copy; 2026 SYS-WEBDEV-ACADEMY</p>\n</footer>`,
        codeExampleCss: `header {\n  background: #0f172a;\n  color: #f8fafc;\n  padding: 1rem 2rem;\n  display: flex;\n  justify-content: space-between;\n}`,
        keyTakeaways: ['Replace generic <div> tags with <header>, <nav>, <main>, and <footer>', 'Enhance screen reader accessibility without adding complex ARIA attributes', 'Boost search engine indexing by providing explicit layout semantics'],
        sandboxBridgeChallengeId: 1
      },
      {
        orderNum: 3,
        title: 'HTML Links, Media & Image Optimization',
        summary: 'Embed optimized images, audio, video elements, and hyperlinks with security targets.',
        contentMarkdown: `### Hyperlinks & Media Elements\nHyperlinks connect web pages across the internet, while HTML5 media tags bring pages to life.\n\nSecurity Rule for External Links:\nAlways pair \`target="_blank"\` with \`rel="noopener noreferrer"\` to prevent window reference security vulnerabilities.\n\nImage Optimization:\nAlways supply the \`alt\` attribute for screen readers and SEO alt description text.`,
        codeExampleHtml: `<!-- Secure External Link -->\n<a href="https://w3.org" target="_blank" rel="noopener noreferrer">\n  Visit W3C Standards\n</a>\n\n<!-- Responsive Image -->\n<img src="https://picsum.photos/400/200" alt="Sample Web Dev Image" width="400" height="200" loading="lazy" />\n\n<!-- HTML5 Audio -->\n<audio controls>\n  <source src="audio.mp3" type="audio/mpeg" />\n</audio>`,
        keyTakeaways: ['Always add rel="noopener noreferrer" when target="_blank" is used on links', 'Provide descriptive alt tags for all <img> elements', 'Use lazy loading (loading="lazy") on non-hero images for performance'],
        sandboxBridgeChallengeId: 1
      },
      {
        orderNum: 4,
        title: 'Accessible Forms & Native Input Validation',
        summary: 'Design user-friendly forms with native browser input types, pattern matching, and label associations.',
        contentMarkdown: `### Form Accessibility & Native Validation\nHTML5 forms include native validation attributes that check user input before form submission.\n\nEssential Attributes:\n- \`required\`: Ensures field cannot be empty.\n- \`type="email"\`: Validates proper email format.\n- \`minlength\` / \`maxlength\`: Enforces text length constraints.\n- \`pattern\`: Enforces custom regex matching.\n\nAlways pair every input with an associated \`<label for="input-id">\` tag for accessibility compliance.`,
        codeExampleHtml: `<form action="/api/submit" method="POST">\n  <label for="user-email">Email Address:</label>\n  <input type="email" id="user-email" name="email" required placeholder="name@example.com" />\n  \n  <label for="user-pass">Password (Min 8 chars):</label>\n  <input type="password" id="user-pass" name="password" required minlength="8" />\n  \n  <button type="submit">Create Account</button>\n</form>`,
        keyTakeaways: ['Always link <label> to <input> using matching for and id attributes', 'Utilize native HTML5 input types like email, date, and tel', 'Use minlength, required, and pattern attributes for instant feedback']
      },
      {
        orderNum: 5,
        title: 'Structured Tables, Lists & SEO Head Tags',
        summary: 'Build clean data tables with thead/tbody, nested lists, and essential OpenGraph SEO head metadata.',
        contentMarkdown: `### Tables, Lists & Meta Head Tags\nData tables display structured grid records, while meta head tags dictate how search engines and social platforms index your website.\n\nTable Architecture:\nUse \`<thead>\`, \`<tbody>\`, \`<tr>\`, \`<th>\`, and \`<td>\` for accessible data grids.`,
        codeExampleHtml: `<head>\n  <meta name="description" content="Master fullstack web development" />\n  <meta property="og:title" content="SYS-WEBDEV-ACADEMY" />\n</head>\n\n<table>\n  <thead>\n    <tr><th>Module</th><th>Duration</th><th>Status</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>HTML5</td><td>5 Hours</td><td>Completed</td></tr>\n    <tr><td>CSS3</td><td>6 Hours</td><td>Unlocked</td></tr>\n  </tbody>\n</table>`,
        keyTakeaways: ['Structure tables using explicit <thead> and <tbody> wrappers', 'Include OpenGraph og:title and og:description for social media share cards', 'Use ordered <ol> and unordered <ul> lists appropriately']
      }
    ]
  },

  // 2. CSS3 TRACK
  {
    trackId: 'css',
    title: 'CSS3 Flexbox, Grid & Responsive Layout Engine',
    level: 'Intermediate',
    description: 'Build flexible modern web interfaces using Flexbox alignment, CSS Grid placement, custom CSS variables, and fluid typography.',
    iconName: 'Layout',
    estimatedHours: 6,
    prerequisiteCourseId: 1, // Requires HTML5
    lessons: [
      {
        orderNum: 1,
        title: 'CSS Fundamentals, Selectors & Specificity',
        summary: 'Understand the cascade, specificity hierarchy, and element/class/id selectors.',
        contentMarkdown: `### The Cascade & Specificity Rules\nCSS (Cascading Style Sheets) controls the visual presentation of HTML elements.\n\nSpecificity Calculation Hierarchy:\n1. Inline styles (\`style="..."\`) = 1000 pts\n2. ID Selectors (\`#header\`) = 100 pts\n3. Class, pseudo-class, attribute selectors (\`.card\`) = 10 pts\n4. Element selectors (\`h1\`, \`p\`) = 1 pt\n\nWhen rules conflict, the declaration with the highest specificity score wins!`,
        codeExampleCss: `/* Element selector */\nh1 { color: #3b82f6; font-size: 2rem; }\n\n/* Class selector */\n.btn-primary {\n  background-color: #4f46e5;\n  color: white;\n  padding: 0.5rem 1rem;\n  border-radius: 0.5rem;\n}\n\n/* ID selector */\n#main-nav { border-bottom: 1px solid #334155; }`,
        keyTakeaways: ['Prefer class selectors (.btn) over ID selectors (#btn) for reusability', 'Avoid using !important as it breaks natural cascade flow', 'Group common rules to minimize CSS code duplication'],
        sandboxBridgeChallengeId: 2
      },
      {
        orderNum: 2,
        title: 'The CSS Box Model, Margins & Padding',
        summary: 'Master box-sizing: border-box, content vs padding boundaries, and border radii.',
        contentMarkdown: `### Understanding the CSS Box Model\nEvery element in CSS is rendered as a rectangular box consisting of four layers:\n1. **Content**: The actual text or media.\n2. **Padding**: Transparent space inside the element border.\n3. **Border**: The outline surrounding padding and content.\n4. **Margin**: Transparent space outside the border separating elements.\n\nGolden Box Model Rule:\n\`\`\`css\n* {\n  box-sizing: border-box;\n}\n\`\`\`\nThis ensures padding and border widths do not accidentally inflate the calculated element dimensions!`,
        codeExampleCss: `* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n.card {\n  width: 300px;\n  padding: 20px;\n  border: 2px solid #6366f1;\n  margin: 15px auto;\n  border-radius: 12px;\n}`,
        keyTakeaways: ['Always set box-sizing: border-box globally at the top of your CSS', 'Use margin: auto to horizontally center fixed-width container elements', 'Keep padding consistent across card and container components']
      },
      {
        orderNum: 3,
        title: 'Flexbox Layouts & Alignment Principles',
        summary: 'Master one-dimensional layouts with display: flex, justify-content, and align-items.',
        contentMarkdown: `### CSS Flexbox Mechanics\nFlexbox is designed for one-dimensional layouts along either a horizontal row or vertical column.\n\nCore Flex Container Properties:\n- \`display: flex;\`: Converts container to flexbox layout context.\n- \`flex-direction: row | column;\`: Sets primary axis orientation.\n- \`justify-content: flex-start | center | space-between;\`: Aligns items on primary axis.\n- \`align-items: center | stretch;\`: Aligns items on cross axis.\n- \`gap: 1rem;\`: Defines spacing between adjacent flex children.`,
        codeExampleHtml: `<div class="card-grid">\n  <div class="card"><h3>Flex Card 1</h3><p>Item content</p></div>\n  <div class="card"><h3>Flex Card 2</h3><p>Item content</p></div>\n</div>`,
        codeExampleCss: `.card-grid {\n  display: flex;\n  gap: 1.5rem;\n  flex-wrap: wrap;\n  justify-content: center;\n}\n.card {\n  flex: 1 1 250px;\n  background: #1e293b;\n  color: #fff;\n  padding: 1.5rem;\n  border-radius: 12px;\n}`,
        keyTakeaways: ['Use display: flex for component-level alignment and toolbars', 'Apply gap property for clean spacing without margin hacks', 'Combine flex-grow, flex-shrink, and flex-basis for fluid responsive cards'],
        sandboxBridgeChallengeId: 2
      },
      {
        orderNum: 4,
        title: 'CSS Grid & Responsive Dashboard Architecture',
        summary: 'Construct two-dimensional grid layouts with CSS Grid repeat() and auto-fit rules.',
        contentMarkdown: `### Powering Modern Web Dashboards with CSS Grid\nCSS Grid provides true two-dimensional layout control over rows and columns simultaneously.\n\nThe Magic Auto-Fit Formula:\n\`\`\`css\ngrid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n\`\`\`\nThis single CSS rule automatically creates a responsive grid that adjusts columns based on screen width without requiring media queries!`,
        codeExampleHtml: `<section class="dashboard-grid">\n  <div class="box">Widget A</div>\n  <div class="box">Widget B</div>\n  <div class="box">Widget C</div>\n</section>`,
        codeExampleCss: `.dashboard-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 1rem;\n}\n.box {\n  background: #334155;\n  color: white;\n  padding: 2rem;\n  border-radius: 8px;\n  text-align: center;\n}`,
        keyTakeaways: ['Use CSS Grid for page-level layouts and multi-column dashboards', 'Leverage repeat(auto-fit, minmax(...)) for automatic responsive column counts', 'Combine grid-area names for complex app wireframes']
      },
      {
        orderNum: 5,
        title: 'CSS Variables, Media Queries & Animations',
        summary: 'Build dark/light themes with CSS custom properties, media queries, and transition keyframes.',
        contentMarkdown: `### Dynamic Styling with Custom Properties & Media Queries\nCSS Variables (\`--var-name\`) allow centralizing design tokens like colors and typography.\n\nTheme Variable Pattern:\n\`\`\`css\n:root {\n  --bg-primary: #ffffff;\n  --text-primary: #0f172a;\n}\n.dark {\n  --bg-primary: #0f172a;\n  --text-primary: #f8fafc;\n}\nbody {\n  background-color: var(--bg-primary);\n  color: var(--text-primary);\n}\n\`\`\``,
        codeExampleCss: `@media (max-width: 768px) {\n  .sidebar { display: none; }\n}\n\n@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(10px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n.animated-card {\n  animation: fadeIn 0.3s ease-out forwards;\n}`,
        keyTakeaways: ['Centralize design tokens in CSS custom properties var(--name)', 'Use mobile-first media queries @media (min-width: 640px)', 'Leverage CSS transitions for subtle hover state feedback']
      }
    ]
  },

  // 3. JAVASCRIPT TRACK
  {
    trackId: 'javascript',
    title: 'Modern JavaScript (ES6+) & DOM Engineering',
    level: 'Intermediate',
    description: 'Deep dive into modern JS features: Arrow functions, Promises, Async/Await, Array iteration methods, and DOM manipulation.',
    iconName: 'Code2',
    estimatedHours: 8,
    prerequisiteCourseId: 2, // Requires CSS3
    lessons: [
      {
        orderNum: 1,
        title: 'Variables, Data Types & Scope Mechanics',
        summary: 'Master const/let block scoping, primitive types vs reference objects, and template literals.',
        contentMarkdown: `### JavaScript Variables & Memory References\nJavaScript is a dynamically typed, single-threaded programming language.\n\nScope Rules:\n- \`const\`: Block-scoped constant binding. Prevents re-assignment.\n- \`let\`: Block-scoped variable binding. Allows value re-assignment.\n- \`var\`: Function-scoped or global binding (Legacy - DO NOT USE).\n\nPrimitive vs Reference Types:\nPrimitives (numbers, strings, booleans) pass by value. Objects and arrays pass by memory reference.`,
        codeExampleJs: `const userAge = 22;\nlet totalPoints = 150;\ntotalPoints += 50; // Valid\n\nconst userProfile = { name: 'Alex', role: 'Student' };\nuserProfile.role = 'Admin'; // Valid object mutation\n\nconsole.log(\`User \${userProfile.name} has \${totalPoints} points\`);`,
        keyTakeaways: ['Default to const for variable declarations and use let only when reassigning', 'Never use legacy var keyword in modern ES6+ code', 'Use template literals `${var}` for variable string interpolation'],
        sandboxBridgeChallengeId: 3
      },
      {
        orderNum: 2,
        title: 'Functions, Arrow Syntax & First-Class Objects',
        summary: 'Understand function declarations, arrow functions, parameter defaults, and closure scope.',
        contentMarkdown: `### Functions as First-Class Citizens\nFunctions in JavaScript are first-class objects, meaning they can be assigned to variables, passed as arguments, and returned from other functions.\n\nArrow Function Syntax:\n\`\`\`javascript\n// Implicit return single line\nconst add = (a, b) => a + b;\n\n// Multi-line block return\nconst calculateGrade = (score) => {\n  if (score >= 90) return 'A';\n  return 'B';\n};\n\`\`\``,
        codeExampleJs: `const calculateDiscount = (price, discountPercent = 10) => {\n  const discountAmount = (price * discountPercent) / 100;\n  return price - discountAmount;\n};\n\nconsole.log('Final Price:', calculateDiscount(100, 20)); // Output: 80`,
        keyTakeaways: ['Use arrow functions () => {} for concise functional syntax', 'Supply default parameter values to prevent undefined math errors', 'Functions retain access to parent scope via closures']
      },
      {
        orderNum: 3,
        title: 'ES6+ Array Methods & Data Transformations',
        summary: 'Learn .map(), .filter(), .reduce(), .find(), and object destructuring pattern matching.',
        contentMarkdown: `### Modern Array Operations\nAvoid imperative \`for\` loops by utilizing declarative array iteration helpers.\n\nCore Methods:\n- \`Array.map()\`: Creates a new array populated with transformed results.\n- \`Array.filter()\`: Returns a new array containing items passing a boolean condition.\n- \`Array.reduce()\`: Accumulates items into a single summary output value.\n- \`Array.find()\`: Locates the first matching element.`,
        codeExampleJs: `const challenges = [\n  { id: 1, title: 'HTML Tags', points: 50, category: 'html' },\n  { id: 2, title: 'Flexbox Align', points: 75, category: 'css' },\n  { id: 3, title: 'Fetch API', points: 100, category: 'js' }\n];\n\n// Filter advanced challenges\nconst highPointChallenges = challenges.filter(c => c.points >= 75);\n\n// Sum total points\nconst totalXP = challenges.reduce((sum, c) => sum + c.points, 0);\nconsole.log('Total Available XP:', totalXP);`,
        keyTakeaways: ['Prefer .map() and .filter() over mutating for loops', 'Use .reduce() for summing metrics or grouping items', 'Master destructuring const { title, points } = challenge'],
        sandboxBridgeChallengeId: 3
      },
      {
        orderNum: 4,
        title: 'DOM Selection, Event Delegation & Dynamic Rendering',
        summary: 'Manipulate HTML elements dynamically using querySelector, addEventListener, and innerHTML.',
        contentMarkdown: `### Interacting with the Document Object Model (DOM)\nJavaScript communicates with HTML through DOM nodes.\n\nEvent Delegation Pattern:\nInstead of attaching event listeners to dozens of individual child elements, attach a single listener to a parent container and inspect \`event.target\`!`,
        codeExampleHtml: `<ul id="task-list">\n  <li data-id="1">Complete HTML Module</li>\n  <li data-id="2">Complete CSS Module</li>\n</ul>`,
        codeExampleJs: `const list = document.getElementById('task-list');\n\n// Event delegation listener\nlist.addEventListener('click', (event) => {\n  if (event.target.tagName === 'LI') {\n    event.target.classList.toggle('completed');\n    console.log('Clicked item ID:', event.target.dataset.id);\n  }\n});`,
        keyTakeaways: ['Use querySelector and querySelectorAll for clean element selection', 'Leverage event delegation on parent containers for dynamic list performance', 'Avoid direct innerHTML injection with untrusted user text to prevent XSS']
      },
      {
        orderNum: 5,
        title: 'Asynchronous JS, Promises & Fetch API',
        summary: 'Handle network requests and asynchronous code seamlessly using async/await and try/catch blocks.',
        contentMarkdown: `### Asynchronous Programming with Async/Await\nJavaScript executes on a single-threaded event loop. Asynchronous code allows your application to fetch network data without freezing the browser UI.\n\nFetching Data Example Pattern:\n\`\`\`javascript\nasync function fetchUserData(userId) {\n  try {\n    const response = await fetch(\`/api/users/\${userId}\`);\n    if (!response.ok) throw new Error('Failed to load user');\n    const data = await response.json();\n    return data;\n  } catch (err) {\n    console.error('API Error:', err);\n  }\n}\n\`\`\``,
        codeExampleJs: `async function loadDashboard() {\n  try {\n    const res = await fetch('/api/dashboard');\n    const data = await res.json();\n    console.log('User Dashboard Data Loaded:', data);\n  } catch (error) {\n    console.error('Fetch error:', error);\n  }\n}\nloadDashboard();`,
        keyTakeaways: ['Always mark asynchronous functions with the async keyword', 'Use await to wait for Promise resolution cleanly', 'Always wrap await statements in try/catch blocks for error handling']
      }
    ]
  },

  // 4. PHP 8 TRACK
  {
    trackId: 'php',
    title: 'PHP 8 Server-Side Scripting & Web Backend',
    level: 'Intermediate',
    description: 'Build dynamic web applications, process forms, handle sessions, manage MySQL/SQLite database PDO connections, and author PHP APIs.',
    iconName: 'Server',
    estimatedHours: 8,
    prerequisiteCourseId: 3, // Requires JavaScript
    lessons: [
      {
        orderNum: 1,
        title: 'PHP 8 Fundamentals, Execution Model & Syntax',
        summary: 'Understand PHP server-side execution, embedded tags, string concatenation, and output buffers.',
        contentMarkdown: `### Introduction to PHP 8\nPHP is a widely-used server-side scripting language that runs on web servers like Apache, Nginx, or built-in CLI servers.\n\nPHP Tag Structure:\n\`\`\`php\n<?php\n  $siteName = "WebDev Academy";\n  $year = 2026;\n  echo "<h1>Welcome to " . $siteName . " (" . $year . ")</h1>";\n?>\n\`\`\`\n\nPHP Variable & Array Basics:\n- Variables start with a dollar sign \`$variableName\`.\n- Strings concatenate using the dot operator \`.\`.\n- Arrays can be indexed \`[1, 2, 3]\` or associative \`['key' => 'value']\`.`,
        codeExamplePhp: `<?php\n  $courses = [\n    ['title' => 'HTML5 Foundations', 'status' => 'Active'],\n    ['title' => 'PHP 8 Backend', 'status' => 'Active']\n  ];\n\n  function renderCourseList(array $items): string {\n    $output = "<ul class='course-list'>";\n    foreach ($items as $item) {\n      $output .= "<li>" . htmlspecialchars($item['title']) . " - " . $item['status'] . "</li>";\n    }\n    $output .= "</ul>";\n    return $output;\n  }\n\n  echo renderCourseList($courses);\n?>`,
        keyTakeaways: ['PHP code executes exclusively on the server before sending HTML to client browser', 'Use htmlspecialchars() to prevent Cross-Site Scripting (XSS) when echoing input', 'Master associative arrays [key => value] for handling dynamic records']
      },
      {
        orderNum: 2,
        title: 'PHP Control Structures & Modular Functions',
        summary: 'Write robust conditionals, loops, strict type hints, and match expressions.',
        contentMarkdown: `### Modern PHP 8 Type System & Match Expressions\nPHP 8 introduced strict type declarations and the \`match\` expression as a cleaner alternative to \`switch\`.\n\nMatch Expression Example:\n\`\`\`php\n$statusCode = 200;\n$message = match ($statusCode) {\n  200, 201 => 'Request Succeeded',\n  401 => 'Unauthorized Access',\n  404 => 'Resource Not Found',\n  default => 'Server Error'\n};\n\`\`\``,
        codeExamplePhp: `<?php\ndeclare(strict_types=1);\n\nfunction calculateProgress(int $completed, int $total): float {\n  if ($total === 0) return 0.0;\n  return round(($completed / $total) * 100, 2);\n}\n\necho "Progress: " . calculateProgress(4, 5) . "%";\n?>`,
        keyTakeaways: ['Enable declare(strict_types=1) at the top of PHP files for strict type checking', 'Use match expressions for strict value matching without break statements', 'Specify return type hints (e.g. : float) on functions']
      },
      {
        orderNum: 3,
        title: 'Form Handling ($_POST/$_GET) & Input Sanitization',
        summary: 'Extract form inputs safely, sanitize query params, and prevent malicious script injections.',
        contentMarkdown: `### Handling User Inputs in PHP\nPHP populates global arrays \`$_GET\` and \`$_POST\` with request parameters.\n\nSanitization Best Practices:\n- Never trust user inputs.\n- Use \`filter_input()\` or \`trim()\` + \`htmlspecialchars()\`.`,
        codeExamplePhp: `<?php\nif ($_SERVER['REQUEST_METHOD'] === 'POST') {\n  $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);\n  $username = trim($_POST['username'] ?? '');\n  \n  if (!$email) {\n    http_response_code(400);\n    echo "Invalid email format supplied";\n    exit;\n  }\n  \n  echo "Welcome, " . htmlspecialchars($username);\n}\n?>`,
        keyTakeaways: ['Validate inputs using filter_input() or filter_var()', 'Always verify request method via $_SERVER["REQUEST_METHOD"]', 'Return appropriate HTTP status codes (400, 401, 404)']
      },
      {
        orderNum: 4,
        title: 'PHP Sessions, Authentication & Cookie Security',
        summary: 'Process POST forms, validate credentials, manage secure $_SESSION cookies, and hash passwords using password_hash().',
        contentMarkdown: `### Processing Forms & Authentication in PHP\nPHP handles incoming form submissions via superglobals \`$_GET\` and \`$_POST\`.\n\nSecure Password Hashing in PHP:\n\`\`\`php\n// Hash password before saving to database\n$hashedPassword = password_hash($rawPassword, PASSWORD_DEFAULT);\n\n// Verify password during login\nif (password_verify($inputPassword, $storedHash)) {\n  session_start();\n  $_SESSION['user_id'] = $user['id'];\n  echo "Login successful!";\n}\n\`\`\``,
        codeExamplePhp: `<?php\nsession_start();\n\nif ($_SERVER['REQUEST_METHOD'] === 'POST') {\n  $username = trim($_POST['username'] ?? '');\n  $password = $_POST['password'] ?? '';\n  \n  if (!empty($username) && strlen($password) >= 8) {\n    $_SESSION['authenticated_user'] = $username;\n    echo json_encode(['status' => 'success', 'user' => $username]);\n  } else {\n    http_response_code(400);\n    echo json_encode(['error' => 'Invalid username or password length']);\n  }\n}\n?>`,
        keyTakeaways: ['Always call session_start() at the top of PHP files before output', 'Use password_hash() with PASSWORD_DEFAULT for secure storage', 'Sanitize and validate all incoming $_POST inputs before database insertion']
      },
      {
        orderNum: 5,
        title: 'PHP PDO Database Integration & SQLite Connections',
        summary: 'Connect PHP to SQLite or MySQL using PDO prepared statements to eliminate SQL injection.',
        contentMarkdown: `### Connecting PHP to Databases with PDO\nPHP Data Objects (PDO) provides a consistent interface for interacting with databases safely.\n\nPDO Prepared Statement Example:\n\`\`\`php\n$pdo = new PDO('sqlite:data/academy.db');\n$stmt = $pdo->prepare('SELECT * FROM users WHERE username = :user');\n$stmt->execute([':user' => $username]);\n$user = $stmt->fetch(PDO::FETCH_ASSOC);\n\`\`\``,
        codeExamplePhp: `<?php\ntry {\n  $pdo = new PDO('sqlite:data/academy.db');\n  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);\n  \n  $stmt = $pdo->prepare('INSERT INTO users (username, password) VALUES (?, ?)');\n  $stmt->execute(['alex_dev', password_hash('secret123', PASSWORD_DEFAULT)]);\n  \n  echo "User inserted cleanly with ID: " . $pdo->lastInsertId();\n} catch (PDOException $e) {\n  echo "Database error: " . $e->getMessage();\n}\n?>`,
        keyTakeaways: ['Always use PDO with prepared statements to prevent SQL Injection', 'Set ERRMODE_EXCEPTION on PDO instances for error catching', 'Never concatenate raw variables directly into SQL queries']
      }
    ]
  },

  // 5. SQL TRACK
  {
    trackId: 'sql',
    title: 'Relational Database Design & SQL Querying',
    level: 'Intermediate',
    description: 'Design normalized SQL tables, write SELECT queries, execute JOIN operations, and secure queries with PDO Prepared Statements.',
    iconName: 'Database',
    estimatedHours: 6,
    prerequisiteCourseId: 4, // Requires PHP 8
    lessons: [
      {
        orderNum: 1,
        title: 'Relational Table Creation & Constraints (DDL)',
        summary: 'Learn SQL Data Definition Language (DDL) commands: CREATE TABLE, PRIMARY KEY, FOREIGN KEY, and UNIQUE.',
        contentMarkdown: `### Relational Database Fundamentals\nRelational databases organize data into structured tables connected by keys.\n\nCore Constraints:\n- \`PRIMARY KEY\`: Uniquely identifies each row in a table.\n- \`FOREIGN KEY\`: Links a column to a primary key in another table.\n- \`NOT NULL\`: Prevents NULL values in vital columns.\n- \`UNIQUE\`: Guarantees values in a column are distinct across rows.`,
        codeExampleSql: `CREATE TABLE users (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  username VARCHAR(50) UNIQUE NOT NULL,\n  email VARCHAR(100) NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE TABLE orders (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  user_id INTEGER NOT NULL,\n  total_amount DECIMAL(10,2) NOT NULL,\n  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE\n);`,
        keyTakeaways: ['Use AUTOINCREMENT PRIMARY KEY for primary key indexing', 'Enforce relational integrity using FOREIGN KEY constraints', 'Index unique fields like emails and usernames']
      },
      {
        orderNum: 2,
        title: 'Data Insertion, Updates & Deletions (DML)',
        summary: 'Master INSERT INTO, UPDATE SET, and DELETE FROM statements with explicit WHERE guards.',
        contentMarkdown: `### Data Manipulation Language (DML)\nDML commands modify data records inside established database tables.\n\nCritical Guard Rule:\nAlways supply a \`WHERE\` clause when executing \`UPDATE\` or \`DELETE\` statements! Running \`DELETE FROM users\` without a \`WHERE\` condition will wipe the entire table!`,
        codeExampleSql: `-- Insert record\nINSERT INTO users (username, email) VALUES ('mamat_dev', 'mamat@elixir.com');\n\n-- Update record safely\nUPDATE users \nSET email = 'mamat_new@elixir.com' \nWHERE username = 'mamat_dev';\n\n-- Delete record safely\nDELETE FROM users WHERE id = 5;`,
        keyTakeaways: ['Always verify WHERE clauses before executing UPDATE or DELETE queries', 'Perform multi-row inserts inside database transactions for speed', 'Check rows affected count after DML execution']
      },
      {
        orderNum: 3,
        title: 'SQL Data Querying & Filtering Techniques',
        summary: 'Retrieve and analyze data across multiple linked tables using SELECT, WHERE, LIKE, ORDER BY, and LIMIT.',
        contentMarkdown: `### Querying Records with SELECT\nThe \`SELECT\` statement fetches rows from database tables according to specified filters.`,
        codeExampleSql: `SELECT id, username, email, streakDays \nFROM users \nWHERE streakDays >= 3 AND role = 'student'\nORDER BY streakDays DESC \nLIMIT 10;`,
        keyTakeaways: ['Avoid SELECT * in production; explicitly request needed columns', 'Use ORDER BY column ASC/DESC for sorted results', 'Apply LIMIT to paginate large result sets']
      },
      {
        orderNum: 4,
        title: 'Multi-Table INNER & LEFT JOIN Operations',
        summary: 'Retrieve and analyze data across multiple linked tables using SELECT, WHERE, GROUP BY, and JOIN statements.',
        contentMarkdown: `### Joining Data Across SQL Tables\nWhen data is normalized across multiple tables, use \`JOIN\` statements to combine relevant records.\n\nSQL Query Syntax:\n\`\`\`sql\nSELECT users.username, COUNT(orders.id) AS total_orders, SUM(orders.total_amount) AS total_spent\nFROM users\nINNER JOIN orders ON users.id = orders.user_id\nGROUP BY users.id\nHAVING total_spent > 100\nORDER BY total_spent DESC;\n\`\`\``,
        codeExampleSql: `SELECT \n  users.name,\n  users.email,\n  user_progress.points,\n  user_progress.earnedBadgeIds\nFROM users\nINNER JOIN user_progress ON users.id = user_progress.userId\nWHERE users.role = 'student'\nORDER BY user_progress.points DESC;`,
        keyTakeaways: ['INNER JOIN returns matching records existing in both tables', 'Use GROUP BY to aggregate statistics like COUNT and SUM', 'Filter aggregated results using HAVING instead of WHERE']
      },
      {
        orderNum: 5,
        title: 'Aggregations, Indexes & Prepared Statements',
        summary: 'Optimize query performance with indexes and prevent SQL injections with parameterized queries.',
        contentMarkdown: `### SQL Optimization & Prepared Statement Defense\nIndexes dramatically speed up query lookup speeds on large tables by building B-Tree lookup pointers.\n\nCreating an Index:\n\`\`\`sql\nCREATE INDEX idx_users_username ON users(username);\n\`\`\``,
        codeExampleSql: `-- Parameterized Query Example in SQL Engine\nSELECT id, username, role FROM users WHERE username = ? AND role = ?;`,
        keyTakeaways: ['Add indexes on frequently queried columns in WHERE and JOIN clauses', 'Use prepared statements with parameter placeholders (?) to stop SQL injection', 'Analyze query performance using EXPLAIN QUERY PLAN']
      }
    ]
  },

  // 6. FULL-STACK SECURITY TRACK
  {
    trackId: 'fullstack',
    title: 'Full-Stack Architecture & Web Security',
    level: 'Advanced',
    description: 'Understand backend REST APIs, JWT authentication, CORS header management, and OWASP top security best practices.',
    iconName: 'ShieldCheck',
    estimatedHours: 8,
    prerequisiteCourseId: 5, // Requires SQL
    lessons: [
      {
        orderNum: 1,
        title: 'RESTful API Design & HTTP Status Codes',
        summary: 'Design clean REST API endpoints, standard JSON responses, and appropriate status code headers.',
        contentMarkdown: `### RESTful API Architecture\nRepresentational State Transfer (REST) is an architectural style for designing networked applications.\n\nStandard HTTP Methods & Status Codes:\n- \`GET 200 OK\`: Retrieve resources.\n- \`POST 201 Created\`: Create a new resource.\n- \`PUT / PATCH 200 OK\`: Update existing resources.\n- \`DELETE 204 No Content\`: Delete a resource.\n- \`400 Bad Request\`: Invalid request payload.\n- \`401 Unauthorized\`: Authentication required.\n- \`403 Forbidden\`: Authenticated but lacking permission.`,
        codeExampleJs: `app.get('/api/users/:id', async (req, res) => {\n  const user = await dbGet('SELECT id, username, email FROM users WHERE id = ?', [req.params.id]);\n  if (!user) return res.status(404).json({ error: 'User not found' });\n  res.json({ user });\n});`,
        keyTakeaways: ['Use nouns for endpoint paths (e.g. /api/users instead of /api/getUsers)', 'Return correct HTTP status codes matching outcome', 'Consistently respond with structured JSON bodies'],
        sandboxBridgeChallengeId: 3
      },
      {
        orderNum: 2,
        title: 'JWT Authentication & Stateless API Tokens',
        summary: 'Implement secure JSON Web Token authentication for single-page applications and REST endpoints.',
        contentMarkdown: `### Stateless Auth with JSON Web Tokens (JWT)\nJWT allows stateless authentication where the client passes a digitally signed token in the \`Authorization: Bearer <token>\` header.\n\nJWT Structure:\n1. **Header**: Algorithm and token type.\n2. **Payload**: User identity claims (e.g. userId, role, expiration).\n3. **Signature**: Cryptographic signature generated with server secret key.`,
        codeExampleJs: `import jwt from 'jsonwebtoken';\n\n// Generate JWT token on login\nconst token = jwt.sign(\n  { id: user.id, username: user.username, role: user.role },\n  process.env.JWT_SECRET,\n  { expiresIn: '24h' }\n);\n\n// Middleware to verify token\nfunction verifyToken(req, res, next) {\n  const authHeader = req.headers.authorization;\n  if (!authHeader) return res.status(401).json({ error: 'No token provided' });\n  \n  const token = authHeader.split(' ')[1];\n  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {\n    if (err) return res.status(403).json({ error: 'Invalid token' });\n    req.user = decoded;\n    next();\n  });\n}`,
        keyTakeaways: ['Store server secrets in process.env environment variables', 'Include user ID and role claims in JWT payloads', 'Enforce Bearer authorization headers on all protected API endpoints']
      },
      {
        orderNum: 3,
        title: 'OWASP Security: Defending Against XSS & CSRF',
        summary: 'Sanitize rendered content, enable SameSite cookies, and enforce Content-Security-Policy.',
        contentMarkdown: `### Web Vulnerabilities & OWASP Safeguards\nUnderstanding common attack vectors is critical for full-stack developers.\n\n1. **Cross-Site Scripting (XSS)**: Injection of malicious scripts executed in user browsers. Defend by escaping output text (\`htmlspecialchars\`) and avoiding unsafe innerHTML.\n2. **Cross-Site Request Forgery (CSRF)**: Unintended actions executed on behalf of authenticated users. Defend using Anti-CSRF tokens and \`SameSite=Strict\` cookies.`,
        codeExampleJs: `// Node Express Helmet Security Headers\nimport helmet from 'helmet';\napp.use(helmet());`,
        keyTakeaways: ['Never inject raw untrusted user strings directly into DOM', 'Use SameSite=Strict and HttpOnly flags on session cookies', 'Apply security header middlewares like Helmet']
      },
      {
        orderNum: 4,
        title: 'CORS Configuration & API Rate Limiting',
        summary: 'Configure Cross-Origin Resource Sharing headers and rate limits to block API abuse.',
        contentMarkdown: `### CORS & Rate Limiting Hardening\nBy default, web browsers block cross-origin HTTP requests.\n\nCORS Setup Pattern:\nSpecify explicit allowed origins rather than using wildcard \`*\` on authenticated API endpoints.`,
        codeExampleJs: `import cors from 'cors';\nimport rateLimit from 'express-rate-limit';\n\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 minutes\n  max: 100 // max 100 requests per IP\n});\n\napp.use(cors({ origin: 'https://webdev.academy', credentials: true }));\napp.use('/api/', limiter);`,
        keyTakeaways: ['Restricted origin domains on production CORS configurations', 'Apply IP rate limiting to prevent brute-force attacks', 'Log unusual API traffic patterns for audit monitoring']
      },
      {
        orderNum: 5,
        title: 'Full-Stack Architecture & Environment Security',
        summary: 'Protect API keys with server-side proxy routes, environment secret vaulting, and encrypted database backups.',
        contentMarkdown: `### Architectural Security Best Practices\nMaintain strict separation of concerns between client and server layers.\n\nCore Principles:\n- **Never leak secrets**: Secrets like Gemini API keys or database encryption passwords must strictly reside in server-side \`process.env\` variables.\n- **Encrypted Storage**: Store user records in encrypted database vaults (AES-256).\n- **Graceful Failovers**: Implement fallback mechanisms for backend database driver issues.`,
        codeExampleJs: `// Accessing server secret safely\nconst dbEncryptionKey = process.env.DB_ENCRYPTION_KEY;\nif (!dbEncryptionKey) {\n  throw new Error('FATAL: Encryption key missing in environment!');\n}`,
        keyTakeaways: ['Never expose private API keys in client-side JS bundles', 'Encrypt database files at rest using AES-256 CBC', 'Auditing system activity logs for administrative tracking']
      }
    ]
  }
];
