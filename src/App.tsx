import { PreviewBuilder } from "./features/preview-builder";
import { FormProvider } from "./features/overrides-form/context/form.context";
import "./App.css";

const App = () => {
  return (
    <FormProvider>
      <PreviewBuilder />
    </FormProvider>
  );
};

export default App;
