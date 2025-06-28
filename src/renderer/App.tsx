import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import InstallPackage from './pages/InstallPackage';
import ExampleScraper from './pages/ExampleScraper';

function Hello() {
  const navigate = useNavigate(); // 👈 Hook for programmatic navigation

  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="folded hands">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>

      {/* 👇 Add this button to navigate to InstallPackage */}
      <div className="Hello" style={{ marginTop: 20 }}>
        <button type="button" onClick={() => navigate('/install-package')}>
          <span role="img" aria-label="package">
            📦
          </span>
          Install Crawlee
        </button>
      </div>

      <div className="Hello" style={{ marginTop: 20 }}>
        <button type="button" onClick={() => navigate('/example-scraper')}>
          <span role="img" aria-label="package">
            📦
          </span>
          Run Example
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/install-package" element={<InstallPackage />} />
        <Route path="/example-scraper" element={<ExampleScraper />} />
      </Routes>
    </Router>
  );
}
