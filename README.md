# 🧮 Calculator with Quadratic Equation Solver (React)

A responsive and interactive calculator built using **React.js**. It supports both basic arithmetic and quadratic equation solving with visual graph output using **Chart.js**.

## 🚀 Project Functions

### ✅ Basic Calculator:
- Supports arithmetic operations: `+`, `−`, `×`, `÷`
- Dynamic input field and expression evaluation
- Reset/clear functionality

### 📐 Quadratic Equation Solver:
- Accepts coefficients `a`, `b`, and `c`
- Calculates:
  - Discriminant (Δ = b² − 4ac)
  - Real or complex roots
  - Vertex of the parabola
- Graphs the quadratic function using **Chart.js**
- Displays formatted output and interpretation

## 🧰 Tech Stack Used

| Layer         | Technology         |
|---------------|--------------------|
| Frontend UI   | **React.js**       |
| Styling       | **CSS**            |
| Logic & State | **JavaScript + React Hooks** |
| Graph Plotting| **Chart.js** (via npm) |

## 📁 Project Structure

```
calculatorWithQuadratic/
├── public/
│   └── index.html
├── src/
│   ├── App.js              # Main app logic
│   ├── Calculator.js       # Basic calculator component
│   ├── QuadraticSolver.js  # Quadratic solver component
│   ├── Graph.js            # Chart.js integration
│   ├── index.js            # React DOM render
│   └── style.css
├── package.json
└── README.md
```

## 🧪 Sample Inputs

### Real Roots:
```
a = 1, b = -5, c = 6
Output: Roots are 2 and 3
```

### Complex Roots:
```
a = 1, b = 2, c = 5
Output: Roots are -1 ± 2i
```

## 📦 How to Run the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/8Leer8/calculatorWithQuadratic.git
cd calculatorWithQuadratic
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 🖼️ Screenshots (Optional)

Add images under a folder named `screenshots/` and reference them like:

```
![Basic Calculator](./screenshots/calculator.png)
![Quadratic Solver](./screenshots/quadratic.png)
```

## 🔧 Planned Features

- Mobile responsiveness
- Dark/light theme toggle
- Input validation and error handling
- Expand to cubic or polynomial solving
