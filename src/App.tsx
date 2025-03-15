import { PreviewBuilder } from "./features/preview-builder";
import { FormProvider } from "./features/overrides-form/form.context";
import "./App.css";

const App = () => {
  return (
    <FormProvider>
      <PreviewBuilder />
    </FormProvider>
  );
};

export default App;
