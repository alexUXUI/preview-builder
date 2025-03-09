import "./App.css";
import MFEOverridesForm from "./components/MFEOverridesForm";

const App = () => {
  // localStorage.setItem(
  //   'hawaii_mfe_overrides',
  //   'thread_1.1.1,document-viewer_2.2.2',
  // );

  return (
    <div className="content">
      <MFEOverridesForm />
    </div>
  );
};

export default App;
